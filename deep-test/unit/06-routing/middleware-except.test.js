/**
 * Phase 6 — Endpoint.middleware()/except() + Registry.bindMiddlewares().
 *
 * DISCOVERY (4.1.2): except() pushes the alias into excludeFromMw but the
 * `this.middlewares.filter(...)` result is discarded, so the middlewares array is
 * NOT mutated by except(). Exclusion is enforced later in bindMiddlewares via
 * excludeFromMw. Both behaviors are pinned below.
 */
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import "../../harness/globals.ts";
import Endpoint from "../../../src/package/framework/Router/Endpoint.js";
import Registry from "../../../src/package/framework/Router/Registry.js";
import Router from "../../../src/package/framework/Router/Router.js";
import Exception from "../../../src/package/framework/ErrorHandler/Exception.js";
beforeAll(async () => {
    await Exception.init({ emit: vi.fn() });
});
beforeEach(() => {
    Router.Middlewares = {
        auth: (_q, _s, n) => n(),
        log: (_q, _s, n) => n(),
    };
});
function makeEndpoint() {
    return new Endpoint({ method: "get", controller: "C@m", endpoint: "x", options: {} }, []);
}
describe("Endpoint.middleware / except", () => {
    it("middleware() sets the alias list (string is wrapped)", () => {
        const ep = makeEndpoint();
        ep.middleware("auth");
        expect(ep.middlewares).toEqual(["auth"]);
        ep.middleware(["auth", "log"]);
        expect(ep.middlewares).toEqual(["auth", "log"]);
    });
    it("except() records the exclusion without mutating the middleware list", () => {
        const ep = makeEndpoint();
        ep.middleware(["auth", "log"]);
        ep.except("log");
        expect(ep.excludeFromMw).toContain("log");
        expect(ep.middlewares).toEqual(["auth", "log"]); // unchanged (discovery)
    });
});
describe("Registry.bindMiddlewares", () => {
    it("binds known middlewares and skips excluded ones", async () => {
        const registry = new Registry({ prefix: "x", auth: null, AuthRouteExceptions: [] });
        const ep = makeEndpoint();
        ep.middleware(["auth", "log"]);
        ep.except("log");
        await registry.bindMiddlewares(ep);
        expect(ep.$middlewares).toHaveLength(1);
        expect(ep.$middlewares[0]).toBe(Router.Middlewares.auth);
    });
    it("records an exception for an unregistered middleware alias", async () => {
        const registry = new Registry({ prefix: "x", auth: null, AuthRouteExceptions: [] });
        const ep = makeEndpoint();
        ep.middleware(["ghost"]);
        await registry.bindMiddlewares(ep);
        expect(ep.$middlewares).toHaveLength(0);
        expect(ep.exceptions.length).toBeGreaterThan(0);
    });
});
