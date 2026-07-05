/**
 * Phase 6 — group/router prefix resolution through Registry.expand().
 */
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import "../../harness/globals.ts";
import Registry from "../../../src/package/framework/Router/Registry.js";
import Route from "../../../src/package/framework/Router/Route.js";
import Router from "../../../src/package/framework/Router/Router.js";
import Exception from "../../../src/package/framework/ErrorHandler/Exception.js";
beforeAll(async () => {
    await Exception.init({ emit: vi.fn() });
});
beforeEach(() => {
    Router.defaultControllerDir = "";
    // a controller whose key matches "/usercontroller" so bindMethods succeeds cleanly
    Router.Controllers = { "ctrls/usercontroller": { instance: { list: () => { } } } };
    Router.Middlewares = {};
});
function makeRoute(prefix) {
    const registry = new Registry({ prefix, auth: null, AuthRouteExceptions: [] });
    return { registry, route: new Route(registry) };
}
describe("Registry path building", () => {
    it("prepends the router prefix to a bare endpoint", async () => {
        const { registry, route } = makeRoute("users");
        const ep = route.get("list", "UserController@list");
        await registry.expand();
        expect(ep.path).toBe("/users/list");
        expect(ep.exceptions).toHaveLength(0);
    });
    it("concatenates a single group prefix", async () => {
        const { registry, route } = makeRoute("users");
        let ep;
        route.group({ prefix: "v1" }, () => {
            ep = route.get("list", "UserController@list");
        });
        await registry.expand();
        expect(ep.path).toBe("/users/v1/list");
    });
    it("concatenates nested group prefixes in declaration order", async () => {
        const { registry, route } = makeRoute("users");
        let ep;
        route.group({ prefix: "v1" }, () => {
            route.group({ prefix: "admin" }, () => {
                ep = route.get("list", "UserController@list");
            });
        });
        await registry.expand();
        expect(ep.path).toBe("/users/v1/admin/list");
    });
});
