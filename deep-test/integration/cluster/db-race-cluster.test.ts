/**
 * Phase 11/12 — MongoDB data-integrity UNDER CLUSTERING.
 *
 * Clustering is the scenario where the default single-process assumptions break:
 * N worker processes share one database, so unique constraints and hooks must
 * hold across processes, not just within one. This spawns a real multi-process
 * race (Node `cluster` — the same primitive chasi's ServiceCluster uses) via
 * harness/cluster-db-race.mjs and asserts the integrity guarantees survive it.
 *
 * Opt-in: DEEP_INTEGRATION=1 with a running MongoDB. The probe self-cleans its
 * collection each run.
 */
import { describe, it, expect } from "vitest";
import { spawn } from "node:child_process";
import path from "node:path";

const RUN = !!process.env.DEEP_INTEGRATION;
const DB_URL = process.env.RACE_DB_URL ?? "mongodb://localhost:27017/deepTest";

type RaceResult = {
  workers: number;
  success: number;
  duplicate: number;
  error: number;
  docCount: number;
  hashed: boolean;
};

function runClusterRace(workers: number, email: string, alias: string): Promise<RaceResult> {
  return new Promise((resolve, reject) => {
    const entry = path.resolve(process.cwd(), "deep-test/harness/cluster-db-race.mjs");
    const child = spawn(process.execPath, [entry], {
      env: {
        ...process.env,
        RACE_DB_URL: DB_URL,
        RACE_EMAIL: email,
        RACE_ALIAS: alias,
        RACE_WORKERS: String(workers),
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d.toString()));
    child.stderr.on("data", (d) => (err += d.toString()));
    child.on("error", reject);
    child.on("exit", (code) => {
      const m = out.match(/RACE_RESULT=(\{.*\})/);
      if (!m) {
        reject(new Error(`cluster probe produced no result (exit ${code}). stderr:\n${err.slice(0, 800)}`));
        return;
      }
      resolve(JSON.parse(m[1]) as RaceResult);
    });
  });
}

describe.skipIf(!RUN)("integration › cluster DB integrity (multi-process race)", () => {
  it("enforces the unique constraint across forked workers — exactly one insert wins", async () => {
    const stamp = Date.now();
    const r = await runClusterRace(4, `race-${stamp}@clu.test`, `race-${stamp}`);

    expect(r.workers).toBe(4);
    expect(r.success).toBe(1); // exactly one worker created the user
    expect(r.duplicate).toBe(3); // the other three were rejected with E11000
    expect(r.error).toBe(0); // no unexpected failures
    expect(r.docCount).toBe(1); // and the DB holds exactly one document — no dupes slipped through
    expect(r.hashed).toBe(true); // the pre-save bcrypt hook ran in the winning worker process
  }, 30000);

  it("holds the invariant at higher worker counts", async () => {
    const stamp = Date.now();
    const r = await runClusterRace(6, `race6-${stamp}@clu.test`, `race6-${stamp}`);

    expect(r.success).toBe(1);
    expect(r.duplicate).toBe(r.workers - 1);
    expect(r.error).toBe(0);
    expect(r.docCount).toBe(1);
  }, 30000);
});
