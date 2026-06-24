/**
 * Out-of-process app launcher for cluster behavioral-parity tests.
 *
 * Unlike harness/app.ts (which boots the framework IN-process for single-worker
 * integration tests), this spawns the built app as a real OS process via
 * `node dist/server.js`. That is the only way to exercise chasi's clustering:
 * `Session.initialize()` forks workers from the primary, which cannot happen
 * inside a vitest worker.
 *
 * Two modes:
 *   - single:  plain process (serviceCluster disabled)
 *   - cluster: CLUSTER=1 WORKERS=n — primary forks n workers that share the port
 *
 * Notes:
 *   - Runs from `dist/` as real prod: NODE_ENV=production (test-only routes off)
 *     and the compiler left enabled (CHASI_COMPILER unset). Build dist first
 *     (`tsc`). Module resolution auto-detects `.js` from dist — no flag needed.
 *   - Spawned `detached` so the whole process group (primary + workers) can be
 *     torn down with a single negative-pid kill.
 */
import { spawn, ChildProcess } from "node:child_process";
import path from "node:path";

export type AppProcess = {
  port: number;
  request: (method: string, p: string, body?: unknown) => Promise<{ status: number; json: any }>;
  stop: () => Promise<void>;
};

export type StartOpts = {
  cluster?: boolean;
  workers?: number;
  port: number;
  dbUrl?: string;
  readyTimeoutMs?: number;
};

export async function startApp(opts: StartOpts): Promise<AppProcess> {
  const { cluster = false, workers = 3, port } = opts;
  const dbUrl = opts.dbUrl ?? "mongodb://localhost:27017/";
  const readyTimeoutMs = opts.readyTimeoutMs ?? 90_000;
  const entry = path.resolve(process.cwd(), "dist/server.js");

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: "production", // real prod boot (not a test run): test-only routes off
    database: "test",
    testDatabaseName: "deepTest",
    dbConStringTest: dbUrl,
    ServerPort: String(port),
    Log_Level: "0",
  };
  delete env.CHASI_COMPILER; // leave the compiler enabled — prod builds the SSR bundle
  if (cluster) {
    env.CLUSTER = "1";
    env.WORKERS = String(workers);
  }

  const child: ChildProcess = spawn(process.execPath, [entry], {
    env,
    stdio: "ignore",
    detached: true,
  });

  const kill = () => {
    try {
      if (child.pid) process.kill(-child.pid, "SIGKILL"); // whole group
    } catch {
      /* already gone */
    }
  };

  // Ready when the port answers an HTTP request (any status = listening).
  const deadline = Date.now() + readyTimeoutMs;
  let ready = false;
  while (Date.now() < deadline) {
    try {
      await fetch(`http://127.0.0.1:${port}/api/users/signin`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      });
      ready = true;
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  if (!ready) {
    kill();
    throw new Error(`app-process: ${cluster ? "cluster" : "single"} app not ready on :${port} within ${readyTimeoutMs}ms`);
  }

  return {
    port,
    async request(method, p, body) {
      const res = await fetch(`http://127.0.0.1:${port}${p}`, {
        method,
        headers: { "content-type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      let json: any = null;
      try {
        json = await res.json();
      } catch {
        /* non-JSON body */
      }
      return { status: res.status, json };
    },
    async stop() {
      kill();
    },
  };
}
