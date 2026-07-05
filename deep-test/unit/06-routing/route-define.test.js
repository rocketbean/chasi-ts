/**
 * Phase 6 — Route definition (Route.ts + Endpoint controller parsing).
 */
import { describe, it, expect } from "vitest";
import "../../harness/globals.ts";
import Registry from "../../../src/package/framework/Router/Registry.js";
import Route from "../../../src/package/framework/Router/Route.js";
function makeRoute() {
    const registry = new Registry({ prefix: "x", auth: null, AuthRouteExceptions: [] });
    return { registry, route: new Route(registry) };
}
describe("Route › endpoint registration", () => {
    it("registers a get endpoint with method, path and parsed controller", () => {
        const { registry, route } = makeRoute();
        const ep = route.get("list", "UserController@list");
        expect(ep.property.method).toBe("get");
        expect(ep.property.endpoint).toBe("list");
        expect(ep.controller).toBe("UserController");
        expect(ep.method).toBe("list");
        expect(registry.routes).toContain(ep);
    });
    it("binds a function controller", () => {
        const { route } = makeRoute();
        const fn = () => { };
        const ep = route.get("ping", fn);
        expect(ep.controller).toBe("Function");
        expect(ep.method).toBe("Function");
        expect(ep.$method).toBe(fn);
    });
    it("treats a single-token controller string as a method name only", () => {
        const { route } = makeRoute();
        const ep = route.get("idx", "indexHandler");
        expect(ep.controller).toBeUndefined();
        expect(ep.method).toBe("indexHandler");
    });
    it("carries inline options/spec onto the endpoint", () => {
        const { route } = makeRoute();
        const spec = { summary: "list users", tags: ["Users"] };
        const ep = route.get("list", "C@list", { spec });
        expect(ep.property.options.spec).toBe(spec);
        expect(ep.spec.summary).toBe("list users");
    });
});
