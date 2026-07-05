/**
 * Phase 12 — cluster behavioral parity (single-process vs clustered).
 *
 * The signal we want: "does enabling serviceCluster change observable behavior?"
 * This boots the REAL built app twice — once single-process, once clustered
 * (CLUSTER=1 WORKERS=3) — runs the same HTTP scenario against each, and asserts
 * the clustered results are IDENTICAL to the single-process baseline.
 *
 * With clustered requests round-robined across workers, this also exercises that
 * a user created via one worker is visible (DB-shared) to signin handled by
 * another, and that auth/validation outcomes don't drift across workers.
 *
 * Opt-in: DEEP_CLUSTER=1 (separate, heavier lane than DEEP_INTEGRATION — each
 * boot runs the prod Vite build). Requires a running MongoDB and a built dist
 * (`npx tsc`).
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";
import { startApp, type AppProcess } from "../../harness/app-process.ts";

const RUN = !!process.env.DEEP_CLUSTER;
const DB_BASE = process.env.RACE_DB_URL ?? "mongodb://localhost:27017/";

/** Wipe the users collection so each mode starts clean and the per-run unique
 *  email/alias never collide with rows left by the other mode. */
async function clearUsers() {
  const conn = await mongoose.createConnection(`${DB_BASE}deepTest`).asPromise();
  try {
    await conn.db.collection("users").deleteMany({});
  } finally {
    await conn.close();
  }
}

/** A fixed scenario reduced to a comparable result object. Creates exactly ONE
 *  distinct user (sidestepping the apps-index multi-user bug) and probes the
 *  auth/validation outcomes. */
async function runScenario(app: AppProcess) {
  const tag = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const user = { name: "Parity", alias: `pp-${tag}`, email: `pp-${tag}@clu.test`, password: "secret1" };

  // NOTE: signin reads `{ email, pass }` from the body (not `password`).
  const signup = await app.request("POST", "/api/users/signup", user);
  const signin = await app.request("POST", "/api/users/signin", { email: user.email, pass: user.password });
  const wrongPass = await app.request("POST", "/api/users/signin", { email: user.email, pass: "wrongpw1" });
  const unknown = await app.request("POST", "/api/users/signin", { email: `ghost-${tag}@x.test`, pass: "secret1" });
  const dup = await app.request("POST", "/api/users/signup", user);

  return {
    signup: signup.status,
    signinOk: signin.status,
    signinHasToken: !!signin.json?.token,
    wrongPassword: wrongPass.status,
    unknownEmail: unknown.status,
    duplicateRejected: dup.status !== 200,
  };
}

describe.skipIf(!RUN)("integration › cluster behavioral parity", () => {
  let singleResult: any;
  let clusterResult: any;

  beforeAll(async () => {
    // Single-process baseline.
    await clearUsers();
    let app = await startApp({ cluster: false, port: 4360 });
    try {
      singleResult = await runScenario(app);
    } finally {
      await app.stop();
    }

    // Clustered (3 workers) — fresh DB so the single-user invariant holds.
    await clearUsers();
    app = await startApp({ cluster: true, workers: 3, port: 4361 });
    try {
      clusterResult = await runScenario(app);
    } finally {
      await app.stop();
    }
  }, 240_000);

  afterAll(async () => {
    await mongoose.disconnect().catch(() => {});
  });

  it("single-process baseline behaves correctly", () => {
    expect(singleResult).toEqual({
      signup: 200,
      signinOk: 200,
      signinHasToken: true,
      wrongPassword: 401,
      unknownEmail: 422,
      duplicateRejected: true,
    });
  });

  it("clustered mode produces identical behavior (parity with single-process)", () => {
    expect(clusterResult).toEqual(singleResult);
  });
});
