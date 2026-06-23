/**
 * Phase 6 — Registry registration, auth attachment, sanitize & dynamic pull.
 */
import { describe, it, expect, vi } from "vitest";
import "../../harness/globals.ts";
import Registry from "../../../src/package/framework/Router/Registry.js";
import Endpoint from "../../../src/package/framework/Router/Endpoint.js";
import Authentication from "../../../src/package/framework/Server/Authentication.js";
function makeEndpoint(method = "get") {
    return new Endpoint({ method, controller: "C@m", endpoint: "x", options: {} }, []);
}
describe("Registry.register › auth wiring", () => {
    it("installs a pass-through useAuth when the router has no auth", async () => {
        const registry = new Registry({ prefix: "x", auth: null, AuthRouteExceptions: [] });
        const ep = makeEndpoint();
        await registry.register(ep);
        expect(registry.routes).toContain(ep);
        const next = vi.fn();
        ep.useAuth({}, {}, next);
        expect(next).toHaveBeenCalledOnce();
    });
    it("delegates to the auth driver's authorize() when auth is set", async () => {
        const handler = vi.fn();
        const authorize = vi.fn(() => handler);
        Authentication.$drivers = { dev: { authorize } };
        const exceptions = [{ url: "/login", m: "post" }];
        const registry = new Registry({ prefix: "x", auth: "dev", AuthRouteExceptions: exceptions });
        const ep = makeEndpoint();
        await registry.register(ep);
        expect(authorize).toHaveBeenCalledWith(ep, exceptions);
        expect(ep.useAuth).toBe(handler);
    });
});
describe("Registry helpers", () => {
    it("sanitizeRoute strips a single leading or trailing slash", () => {
        const registry = new Registry({ prefix: "x" });
        expect(registry.sanitizeRoute("users/")).toBe("users");
        expect(registry.sanitizeRoute("/users")).toBe("users");
        expect(registry.sanitizeRoute("a/b/")).toBe("a/b");
    });
    // DISCOVERY (4.1.2): when BOTH slashes are present, the trailing slash check
    // re-indexes the already-shortened string using the stale original `length`,
    // so the trailing slash is not removed. Pinned as actual behavior.
    it("does NOT strip the trailing slash when a leading slash was also present", () => {
        const registry = new Registry({ prefix: "x" });
        expect(registry.sanitizeRoute("/users/")).toBe("users/");
    });
    it("constructEndpoint normalizes the assembled path", () => {
        const registry = new Registry({ prefix: "x" });
        const ep = makeEndpoint();
        ep.path = "";
        ep.property.endpoint = "list";
        registry.constructEndpoint(ep);
        expect(ep.path).toBe("/list");
    });
    it("pullDynamicRoute flags endpoints with a path param", () => {
        const registry = new Registry({ prefix: "x" });
        registry.routes = [];
        const ep = makeEndpoint();
        ep.uPath = "get/users/:id";
        registry.routes.push(ep);
        registry.pullDynamicRoute(ep);
        expect(ep.isDynamic).toBe(true);
    });
});
