/**
 * Cluster DB-integrity probe (subprocess entry).
 *
 * Run by deep-test/integration/cluster/db-race-cluster.test.ts. It uses Node's
 * `cluster` module — the same primitive chasi's ServiceCluster forks with — to
 * spawn N real worker processes that all race to insert the SAME unique user
 * into the live `deepTest` MongoDB.
 *
 * The schema mirrors src/container/models/user.ts where integrity matters:
 * unique `email`/`alias` indexes and the pre-save bcrypt hash. Booting the full
 * chasi HTTP/SSR stack per worker is intentionally avoided (it requires a Vite
 * prod build and is brittle); what clustering actually threatens — multiple
 * independent processes hitting one database — is reproduced exactly here.
 *
 * The primary cleans the collection and builds the unique indexes BEFORE forking
 * so the race is purely on concurrent inserts. Each worker reports its outcome
 * over IPC; the primary verifies final DB state and prints:
 *
 *   RACE_RESULT={"workers":4,"success":1,"duplicate":3,"error":0,"docCount":1,"hashed":true}
 *
 * Env: RACE_DB_URL, RACE_EMAIL, RACE_ALIAS, RACE_WORKERS.
 */
import cluster from "cluster";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const URL = process.env.RACE_DB_URL;
const EMAIL = process.env.RACE_EMAIL;
const ALIAS = process.env.RACE_ALIAS;
const WORKERS = Number(process.env.RACE_WORKERS || 4);

function raceUserModel(conn) {
  const schema = new mongoose.Schema({
    name: String,
    alias: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
  });
  schema.pre("save", async function () {
    if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 8);
  });
  return conn.model("RaceUser", schema);
}

if (cluster.isPrimary) {
  // 1) Clean slate + build the unique indexes ONCE, before any worker forks, so
  //    the race below is purely insert-vs-insert (not a concurrent index build).
  const conn = await mongoose.createConnection(URL).asPromise();
  const User = raceUserModel(conn);
  await User.collection.drop().catch(() => {}); // ignore "ns not found"
  await User.init();
  await conn.close();

  // 2) Fork N workers; collect one outcome per worker (message, or exit if it
  //    died silently).
  const results = [];
  let reported = 0;
  const finishIfDone = async () => {
    if (reported !== WORKERS) return;
    const c = await mongoose.createConnection(URL).asPromise();
    const U = raceUserModel(c);
    const count = await U.countDocuments({ email: EMAIL });
    const sample = await U.findOne({ email: EMAIL });
    await c.close();
    const summary = {
      workers: WORKERS,
      success: results.filter((r) => r.outcome === "success").length,
      duplicate: results.filter((r) => r.outcome === "duplicate").length,
      error: results.filter((r) => r.outcome === "error").length,
      docCount: count,
      hashed: !!sample && String(sample.password).startsWith("$2"),
    };
    console.log("RACE_RESULT=" + JSON.stringify(summary));
    for (const id in cluster.workers) cluster.workers[id].kill();
    process.exit(0);
  };

  for (let i = 0; i < WORKERS; i++) {
    const w = cluster.fork();
    let got = false;
    w.on("message", (m) => {
      got = true;
      results.push(m);
      reported++;
      finishIfDone();
    });
    w.on("exit", () => {
      if (got) return;
      results.push({ outcome: "error", reason: "worker exited without reporting" });
      reported++;
      finishIfDone();
    });
  }
} else {
  // Worker: open an independent connection and race to create the shared user.
  let outcome;
  try {
    const conn = await mongoose.createConnection(URL).asPromise();
    const User = raceUserModel(conn);
    await User.create({ name: "Race", alias: ALIAS, email: EMAIL, password: "secret1" });
    outcome = "success";
    await conn.close();
  } catch (e) {
    outcome = e?.code === 11000 ? "duplicate" : "error";
  }
  process.send({ outcome, pid: process.pid });
  process.exit(0);
}
