/**
 * Phase 6 — group-level middleware propagation to child endpoints.
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
    Router.Controllers = { "ctrls/usercontroller": { instance: { list: () => { } } } };
    Router.Middlewares = { auth: (_req, _res, next) => next() };
});
describe("group middleware", () => {
    it("applies a group's middleware alias to every child endpoint", async () => {
        const registry = new Registry({ prefix: "users", auth: null, AuthRouteExceptions: [] });
        const route = new Route(registry);
        let ep;
        route.group({ prefix: "v1", middleware: "auth" }, () => {
            ep = route.get("list", "UserController@list");
        });
        await registry.expand();
        expect(ep.middlewares).toContain("auth");
        expect(ep.$middlewares).toHaveLength(1);
    });
});
