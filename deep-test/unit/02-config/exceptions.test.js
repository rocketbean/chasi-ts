/**
 * Phase 2 — config/exceptions.ts.
 * .env.test presets database=test (the database log connection reads it).
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import "../../harness/globals.ts";
const snapshot = process.env.database;
afterEach(() => {
    if (snapshot === undefined)
        delete process.env.database;
    else
        process.env.database = snapshot;
    vi.resetModules();
});
async function load() {
    vi.resetModules();
    return (await import("../../../src/config/exceptions.js")).default;
}
describe("config/exceptions › LogType", () => {
    it("defaults the active log type to terminal", async () => {
        expect((await load()).LogType.type).toBe("terminal");
    });
    it("database log connection falls back to 'dev' when database env is unset", async () => {
        delete process.env.database;
        expect((await load()).LogType.params.database.connection).toBe("dev");
    });
    it("database log connection reads the database env var", async () => {
        process.env.database = "audit";
        expect((await load()).LogType.params.database.connection).toBe("audit");
    });
    it("http and textfile params default to empty", async () => {
        const p = (await load()).LogType.params;
        expect(p.http).toEqual({ url: "", method: "" });
        expect(p.textfile).toEqual({ path: "" });
    });
});
describe("config/exceptions › registry & responses", () => {
    it("registers the built-in exception classes", async () => {
        const reg = (await load()).registry;
        expect(reg.ChasiException).toMatch(/ChasiException\.js$/);
        expect(reg.APIException).toMatch(/APIException\.js$/);
    });
    it("maps default response messages by status code", async () => {
        const r = (await load()).responses;
        expect(r[401]).toMatch(/verify your token/);
        expect(r[404]).toMatch(/can't find/);
        expect(r[422]).toMatch(/check the request body/);
        expect(r[500]).toBeTypeOf("string");
        expect(r.default).toBeTypeOf("string");
    });
});
