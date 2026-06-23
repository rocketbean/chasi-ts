/**
 * Phase 2 — config/database.ts.
 * .env.test presets database=test, so default-branch tests delete it.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import "../../harness/globals.ts";
const KEYS = ["database"];
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
    return (await import("../../../src/config/database.js")).default;
}
describe("config/database › host & default resolution", () => {
    it("host falls back to 'local' when database env is unset", async () => {
        set("database", undefined);
        expect((await load()).host).toBe("local");
    });
    it("default falls back to 'dev' when database env is unset", async () => {
        set("database", undefined);
        expect((await load()).default).toBe("dev");
    });
    it("both read the database env var when set", async () => {
        set("database", "prod");
        const cfg = await load();
        expect(cfg.host).toBe("prod");
        expect(cfg.default).toBe("prod");
    });
});
describe("config/database › flags", () => {
    it("bootWithDB defaults to false and hideLogConnectionStrings to true", async () => {
        const cfg = await load();
        expect(cfg.bootWithDB).toBe(false);
        expect(cfg.hideLogConnectionStrings).toBe(true);
    });
});
describe("config/database › connections", () => {
    it("declares mongodb dev and test connections", async () => {
        const cfg = await load();
        expect(cfg.connections.dev.driver).toBe("mongodb");
        expect(cfg.connections.test.driver).toBe("mongodb");
        expect(cfg.connections.dev.params).toBe("?authSource=admin");
        expect(cfg.connections.dev.options).toMatchObject({
            connectTimeoutMS: 1000,
            socketTimeoutMS: 1000,
            serverSelectionTimeoutMS: 5000,
        });
    });
    it("sources connection urls from env", async () => {
        const cfg = await load();
        expect(cfg.connections.dev.url).toBe(process.env.dbConStringDev);
        expect(cfg.connections.test.url).toBe(process.env.dbConStringTest);
    });
});
describe("config/database › modelsDir", () => {
    it("scans the container models directory", async () => {
        expect((await load()).modelsDir).toEqual(["./container/models/"]);
    });
});
