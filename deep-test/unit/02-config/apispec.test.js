/**
 * Phase 2 — config/apispec.ts.
 * .env.test presets ServerPort=3099; the APISPEC and APPNAME vars are unset (defaults apply).
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import "../../harness/globals.ts";
const KEYS = ["APISPEC_ENABLED", "APISPEC_OUTPUT", "APPNAME", "ServerPort"];
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
    return (await import("../../../src/config/apispec.js")).default;
}
describe("config/apispec › enabled flag", () => {
    it("defaults to true when APISPEC_ENABLED is unset", async () => {
        set("APISPEC_ENABLED", undefined);
        expect((await load()).enabled).toBe(true);
    });
    it("is false only for the literal 'false'", async () => {
        set("APISPEC_ENABLED", "false");
        expect((await load()).enabled).toBe(false);
    });
    it("is true for 'true'", async () => {
        set("APISPEC_ENABLED", "true");
        expect((await load()).enabled).toBe(true);
    });
});
describe("config/apispec › output", () => {
    it("defaults filename to api.spec.json and pretty true", async () => {
        set("APISPEC_OUTPUT", undefined);
        const out = (await load()).output;
        expect(out.filename).toBe("api.spec.json");
        expect(out.pretty).toBe(true);
    });
    it("honors APISPEC_OUTPUT", async () => {
        set("APISPEC_OUTPUT", "v1.spec.json");
        expect((await load()).output.filename).toBe("v1.spec.json");
    });
});
describe("config/apispec › definition", () => {
    it("builds the OpenAPI title from APPNAME (default 'Chasi')", async () => {
        set("APPNAME", undefined);
        const def = (await load()).definition;
        expect(def.openapi).toBe("3.0.0");
        expect(def.info.title).toBe("Chasi API");
        expect(def.info.version).toBe("1.0.0");
    });
    it("uses APPNAME when set", async () => {
        set("APPNAME", "Orders");
        expect((await load()).definition.info.title).toBe("Orders API");
    });
    it("server url embeds ServerPort", async () => {
        set("ServerPort", "3099");
        expect((await load()).definition.servers[0].url).toBe("http://localhost:3099");
    });
});
describe("config/apispec › components & security", () => {
    it("declares the bearerAuth security scheme", async () => {
        const c = (await load()).components.securitySchemes.bearerAuth;
        expect(c).toMatchObject({ type: "http", scheme: "bearer", bearerFormat: "JWT" });
    });
    it("applies a global bearerAuth security requirement", async () => {
        expect((await load()).security).toEqual([{ bearerAuth: [] }]);
    });
});
describe("config/apispec › schemas", () => {
    it("uses prefixed keyFormat and per-connection model excludes", async () => {
        const s = (await load()).schemas;
        expect(s.keyFormat).toBe("prefixed");
        expect(s.models.pg.exclude).toEqual(["users", "userApps"]);
        expect(s.models.dev.exclude).toEqual(["user"]);
        expect(s.models.mysql.exclude).toEqual(["UserApp"]);
    });
});
