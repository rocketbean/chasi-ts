/**
 * Phase 2 — config/server.ts.
 *
 * Configs read process.env at module-eval time, so env permutations are tested
 * by mutating process.env then re-importing with vi.resetModules().
 * NOTE: deep-test/.env.test presets ServerPort=3099 and environment=local, so
 * default-branch assertions delete those vars first.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import os from "os";
import "../../harness/globals.ts";
const KEYS = ["ServerPort", "environment", "CLUSTER", "WORKERS"];
const snapshot = {};
for (const k of KEYS)
    snapshot[k] = process.env[k];
afterEach(() => {
    for (const k of KEYS) {
        if (snapshot[k] === undefined)
            delete process.env[k];
        else
            process.env[k] = snapshot[k];
    }
    vi.resetModules();
});
function set(k, v) {
    if (v === undefined)
        delete process.env[k];
    else
        process.env[k] = v;
}
async function load() {
    vi.resetModules();
    return (await import("../../../src/config/server.js")).default;
}
describe("config/server › port", () => {
    it("falls back to the {start,end} range when ServerPort is unset", async () => {
        set("ServerPort", undefined);
        expect((await load()).port).toEqual({ start: 3010, end: 3020 });
    });
    it("uses the raw ServerPort env string when set", async () => {
        set("ServerPort", "4001");
        expect((await load()).port).toBe("4001");
    });
});
describe("config/server › environment", () => {
    it("falls back to 'local'", async () => {
        set("environment", undefined);
        expect((await load()).environment).toBe("local");
    });
    it("honors the environment env var", async () => {
        set("environment", "dev");
        expect((await load()).environment).toBe("dev");
    });
});
describe("config/server › modes", () => {
    it("local mode is plain http with null certs", async () => {
        const cfg = await load();
        expect(cfg.modes.local).toMatchObject({ protocol: "http", key: null, cert: null });
    });
    it("dev mode is https and sources certs from env", async () => {
        const cfg = await load();
        expect(cfg.modes.dev.protocol).toBe("https");
        expect(cfg.modes.dev.key).toBe(process.env.devKey);
        expect(cfg.modes.dev.cert).toBe(process.env.devCert);
    });
});
describe("config/server › cors", () => {
    it("exposes the default cors block", async () => {
        const cfg = await load();
        expect(cfg.cors.origin).toBe("*");
        expect(cfg.cors.credentials).toBe(false);
        expect(cfg.cors.enablePreflight).toBe(true);
        expect(cfg.cors.allowedHeaders).toEqual(expect.arrayContaining(["Content-Type", "Authorization"]));
    });
});
describe("config/server › serviceCluster", () => {
    it("is disabled by default (CLUSTER unset)", async () => {
        set("CLUSTER", undefined);
        expect((await load()).serviceCluster.enabled).toBe(false);
    });
    it("reflects the CLUSTER env var when set", async () => {
        set("CLUSTER", "1");
        expect((await load()).serviceCluster.enabled).toBe("1");
    });
    it("defaults workers to half the logical CPU count", async () => {
        set("WORKERS", undefined);
        expect((await load()).serviceCluster.workers).toBe(Math.round(os.cpus().length / 2));
    });
    it("coerces the WORKERS env var to a number", async () => {
        set("WORKERS", "3");
        expect((await load()).serviceCluster.workers).toBe(3);
    });
    it("uses schedulingPolicy 2 (round-robin)", async () => {
        expect((await load()).serviceCluster.schedulingPolicy).toBe(2);
    });
});
describe("config/server › hooks.beforeApp", () => {
    it("invokes each compiler engine's hook(getConfig, engine)", async () => {
        const cfg = await load();
        const engine = { hook: vi.fn() };
        const getConfig = vi.fn((name) => (name === "compiler" ? { engines: [engine] } : undefined));
        await cfg.hooks.beforeApp(getConfig);
        expect(getConfig).toHaveBeenCalledWith("compiler");
        expect(engine.hook).toHaveBeenCalledWith(getConfig, engine);
    });
});
