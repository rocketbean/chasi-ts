/**
 * Phase 9 — ApiSpec RouterCollection: path conversion, security & x-middlewares.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "../../harness/globals.ts";
import RouterCollection from "../../../src/container/modules/ApiSpecs/collections/Routers.js";
import Authentication from "../../../src/package/framework/Server/Authentication.js";
const prevApp = globalThis.$app;
function ep(method, path, spec, mw = []) {
    return { property: { method, options: { spec } }, path, spec, groups: [], middlewares: mw, excludeFromMw: [] };
}
beforeEach(() => {
    RouterCollection.paths = {};
    Authentication.$drivers = {};
    const router = {
        property: { auth: "dev", prefix: "/api", AuthRouteExceptions: [{ url: "/api/users/signin", m: "post" }] },
        $registry: {
            routes: [
                ep("get", "/api/users/:id", { summary: "get user", tags: ["Users"], parameters: [] }, ["auth"]),
                ep("post", "/api/users/signin", { summary: "sign in" }),
                { property: { method: "get", options: {} }, path: "/api/health", spec: {}, groups: [], middlewares: [], excludeFromMw: [] },
            ],
        },
    };
    globalThis.$app = { $modules: { RouterModule: { routers: [router] } } };
});
afterEach(() => {
    globalThis.$app = prevApp;
});
describe("RouterCollection.init", () => {
    it("converts :param paths to {param} and includes only spec'd endpoints", async () => {
        await new RouterCollection().init({ security: [{ bearerAuth: [] }] });
        expect(Object.keys(RouterCollection.paths).sort()).toEqual(["/api/users/signin", "/api/users/{id}"]);
    });
    it("marks a protected endpoint with the global security and x-middlewares", async () => {
        await new RouterCollection().init({ security: [{ bearerAuth: [] }] });
        const op = RouterCollection.paths["/api/users/{id}"].get;
        expect(op.summary).toBe("get user");
        expect(op.tags).toEqual(["Users"]);
        expect(op.security).toEqual([{ bearerAuth: [] }]);
        expect(op["x-middlewares"]).toEqual(["auth"]);
    });
    it("marks an AuthRouteException endpoint as public (security: [])", async () => {
        await new RouterCollection().init({ security: [{ bearerAuth: [] }] });
        const op = RouterCollection.paths["/api/users/signin"].post;
        expect(op.security).toEqual([]);
    });
});
