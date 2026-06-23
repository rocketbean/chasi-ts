/**
 * Phase 7 — App build: environment/protocol selection, basepath, port resolution.
 */
import { describe, it, expect } from "vitest";
import http from "http";
import "../../harness/globals.ts";
import App from "../../../src/package/framework/Server/App.js";
function makeApp(overrides = {}) {
    const config = {
        port: 3099,
        environment: "local",
        modes: {
            local: { protocol: "http", key: null, cert: null },
            dev: { protocol: "https", key: "k.pem", cert: "c.pem" },
        },
        cors: { origin: "*" },
        ...overrides,
    };
    return new App(config, { full: { write() { } }, EndTraceFull: { write() { } } });
}
describe("App › environment", () => {
    it("selects http for the local mode", () => {
        expect(makeApp().mode.protocol).toBe("http");
    });
    it("selects https for the dev mode", () => {
        expect(makeApp({ environment: "dev" }).mode.protocol).toBe("https");
    });
    it("builds the basepath from protocol + port", () => {
        expect(makeApp().basepath).toBe("http://localhost:3099");
    });
});
describe("App › install (http)", () => {
    it("creates an http server without binding", async () => {
        const app = makeApp();
        await app.install();
        expect(app.$httpServer).toBeInstanceOf(http.Server);
    });
});
describe("App › _resolvePorts", () => {
    const app = makeApp();
    const resolve = (port) => ((app.config.port = port), app._resolvePorts());
    it("handles a single number", () => {
        expect(resolve(3099)).toEqual([3099]);
    });
    it("handles an explicit list", () => {
        expect(resolve([3010, 3011])).toEqual([3010, 3011]);
    });
    it("expands a {start,end} range", () => {
        expect(resolve({ start: 3010, end: 3012 })).toEqual([3010, 3011, 3012]);
    });
    it("expands a 'start-end' string", () => {
        expect(resolve("3010-3012")).toEqual([3010, 3011, 3012]);
    });
    it("parses a comma list string", () => {
        expect(resolve("3010,3011")).toEqual([3010, 3011]);
    });
    it("throws on an inverted range", () => {
        expect(() => resolve({ start: 5, end: 1 })).toThrow();
    });
    it("throws on a non-numeric value", () => {
        expect(() => resolve("not-a-port")).toThrow();
    });
});
