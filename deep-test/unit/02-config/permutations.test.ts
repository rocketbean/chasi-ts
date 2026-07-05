/**
 * Phase 2/11 — cross-config permutation matrix (unit tier).
 *
 * Phase 2's per-file tests prove each config field in isolation. This file proves
 * COMBINATIONS: a single env bundle is applied, then multiple configs are resolved
 * together and asserted for consistency — e.g. ServerPort must flow identically into
 * server.port, apispec.servers[].url and sdkbuilder.host; `database` must reach both
 * database.ts and exceptions.ts; APPNAME must reach container.ts and apispec.ts.
 *
 * Configs read process.env at module-eval time, so each scenario mutates env and
 * re-imports via vi.resetModules(). (compiler.ts is env-static and pulls Vite, so it
 * is intentionally out of this matrix.)
 */
import { describe, it, expect, vi, afterEach } from "vitest";

// Every env key this matrix drives. Anything not named in a scenario is deleted so
// scenarios are deterministic regardless of .env.test presets.
const KEYS = [
  "environment", "ServerPort", "CLUSTER", "WORKERS", "database", "APPNAME",
  "APISPEC_ENABLED", "SDKBUILDER_ENABLED", "SDK_HOST", "oauthkey",
];
const snapshot: Record<string, string | undefined> = {};
for (const k of KEYS) snapshot[k] = process.env[k];

afterEach(() => {
  for (const k of KEYS) {
    if (snapshot[k] === undefined) delete process.env[k];
    else process.env[k] = snapshot[k];
  }
  vi.resetModules();
});

/** Apply an env bundle: named keys are set, all other controlled keys are cleared. */
function applyEnv(bundle: Record<string, string>) {
  for (const k of KEYS) {
    if (k in bundle) process.env[k] = bundle[k];
    else delete process.env[k];
  }
}

// Static importers (esbuild can't analyze a template-literal dynamic import).
const importers: Record<string, () => Promise<any>> = {
  server: () => import("../../../src/config/server.js"),
  database: () => import("../../../src/config/database.js"),
  authentication: () => import("../../../src/config/authentication.js"),
  apispec: () => import("../../../src/config/apispec.js"),
  sdkbuilder: () => import("../../../src/config/sdkbuilder.js"),
  container: () => import("../../../src/config/container.js"),
  exceptions: () => import("../../../src/config/exceptions.js"),
};

async function load(name: string): Promise<any> {
  vi.resetModules();
  return (await importers[name]()).default;
}

describe("config matrix › local / single-process / mongo-test / apispec on", () => {
  const env = { environment: "local", ServerPort: "3010", database: "test", oauthkey: "secretA" };

  it("server resolves http + chosen port + cluster off", async () => {
    applyEnv(env);
    const server = await load("server");
    expect(server.environment).toBe("local");
    expect(server.modes[server.environment].protocol).toBe("http");
    expect(server.port).toBe("3010");
    expect(server.serviceCluster.enabled).toBe(false);
  });

  it("database + exceptions both resolve the 'test' connection", async () => {
    applyEnv(env);
    expect((await load("database")).host).toBe("test");
    expect((await load("exceptions")).LogType.params.database.connection).toBe("test");
  });

  it("ServerPort propagates into apispec.servers and sdkbuilder.host", async () => {
    applyEnv(env);
    expect((await load("apispec")).definition.servers[0].url).toBe("http://localhost:3010");
    expect((await load("sdkbuilder")).host).toBe("http://localhost:3010");
  });

  it("apispec + sdkbuilder default to enabled; auth key reads oauthkey", async () => {
    applyEnv(env);
    expect((await load("apispec")).enabled).toBe(true);
    expect((await load("sdkbuilder")).enabled).toBe(true);
    expect((await load("authentication")).drivers.dev.key).toBe("secretA");
  });

  it("container.name defaults to Chasi when APPNAME is unset", async () => {
    applyEnv(env);
    expect((await load("container")).name).toBe("Chasi");
  });
});

describe("config matrix › dev / clustered / apispec+sdk off / named app", () => {
  const env = {
    environment: "dev", ServerPort: "8080", CLUSTER: "1", WORKERS: "4",
    database: "prod", APPNAME: "Billing", APISPEC_ENABLED: "false", SDKBUILDER_ENABLED: "false",
  };

  it("server resolves https + clustered workers", async () => {
    applyEnv(env);
    const server = await load("server");
    expect(server.modes[server.environment].protocol).toBe("https");
    expect(server.serviceCluster.enabled).toBe("1");
    expect(server.serviceCluster.workers).toBe(4);
    expect(server.port).toBe("8080");
  });

  it("database + exceptions resolve the 'prod' connection", async () => {
    applyEnv(env);
    expect((await load("database")).default).toBe("prod");
    expect((await load("exceptions")).LogType.params.database.connection).toBe("prod");
  });

  it("apispec + sdkbuilder are disabled together", async () => {
    applyEnv(env);
    expect((await load("apispec")).enabled).toBe(false);
    expect((await load("sdkbuilder")).enabled).toBe(false);
  });

  it("APPNAME propagates into container.name and apispec title", async () => {
    applyEnv(env);
    expect((await load("container")).name).toBe("Billing");
    expect((await load("apispec")).definition.info.title).toBe("Billing API");
  });

  it("sdkbuilder.host falls back to the configured ServerPort when SDK_HOST is unset", async () => {
    applyEnv(env);
    expect((await load("sdkbuilder")).host).toBe("http://localhost:8080");
    // auth key falls back to the built-in default (oauthkey unset)
    expect((await load("authentication")).drivers.dev.key).toBe("chasi-dev");
  });
});

describe("config matrix › explicit SDK host overrides the port-derived default", () => {
  it("uses SDK_HOST verbatim while server.port stays independent", async () => {
    applyEnv({ ServerPort: "3010", SDK_HOST: "https://cdn.example", SDKBUILDER_ENABLED: "true" });
    expect((await load("sdkbuilder")).host).toBe("https://cdn.example");
    expect((await load("sdkbuilder")).enabled).toBe(true);
    expect((await load("server")).port).toBe("3010");
  });
});
