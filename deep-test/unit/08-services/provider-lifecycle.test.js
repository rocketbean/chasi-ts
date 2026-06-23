/**
 * Phase 8 — Provider static wiring (init/getServices/inject) against a stubbed
 * Handler singleton.
 */
import { describe, it, expect, beforeAll } from "vitest";
import "../../harness/globals.ts";
import { Handler } from "../../../src/package/Handler.js";
import Provider from "../../../src/package/framework/Services/Provider.js";
beforeAll(() => {
    Handler._instance = {
        $observer: "OBSERVER",
        _config: { app: "chasi" },
        pipe: null,
        $services: { routers: { r: 1 }, sockets: { s: 2 } },
    };
    Provider.init();
});
describe("Provider.init", () => {
    it("captures the observer and config from the Handler singleton", () => {
        expect(Provider.$observer).toBe("OBSERVER");
        expect(Provider.config).toEqual({ app: "chasi" });
    });
});
describe("Provider.getServices / inject", () => {
    it("lists the registered service names", () => {
        expect(Provider.getServices()).toEqual(["routers", "sockets"]);
    });
    it("injects a service by name", () => {
        expect(Provider.inject("routers")).toEqual({ r: 1 });
    });
    it("throws when injecting an unknown module", () => {
        expect(() => Provider.inject("ghost")).toThrow(/cannot be found/);
    });
});
