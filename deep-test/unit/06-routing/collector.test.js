/**
 * Phase 6 — RouteCollector (Collector.ts) wiring.
 */
import { describe, it, expect } from "vitest";
import "../../harness/globals.ts";
// Import Registry first: it pulls Router→Collector in the order that resolves the
// Collector↔Registry↔Router import cycle (importing Collector first throws).
import Registry from "../../../src/package/framework/Router/Registry.js";
import Route from "../../../src/package/framework/Router/Route.js";
import RouteCollector from "../../../src/package/framework/Router/Collector.js";
function makeCollector() {
    return new RouteCollector({ prefix: "x", auth: null, namespace: "n", AuthRouteExceptions: [] });
}
describe("RouteCollector", () => {
    it("constructs a Registry and a Route from the property", () => {
        const c = makeCollector();
        expect(c.$registry).toBeInstanceOf(Registry);
        expect(c.$route).toBeInstanceOf(Route);
    });
    it("derives the supported verb list from the methods registry", () => {
        const c = makeCollector();
        expect(c.methods).toEqual(expect.arrayContaining(["get", "post", "put", "patch", "delete", "options", "search"]));
    });
    it("collectEndpointFn invokes the namespace fn with the shared $route", async () => {
        const c = makeCollector();
        let received;
        await c.collectEndpointFn((route) => {
            received = route;
        });
        expect(received).toBe(c.$route);
    });
});
