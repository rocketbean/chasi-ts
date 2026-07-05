/**
 * Phase 9 — ApiSpec RouterCollection: path conversion, security & x-middlewares.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "../../harness/globals.ts";
import RouterCollection from "../../../src/container/modules/ApiSpecs/collections/Routers.js";
import Authentication from "../../../src/package/framework/Server/Authentication.js";

const prevApp = (globalThis as any).$app;

function ep(method: string, path: string, spec: any, mw: string[] = []) {
  return { property: { method, options: { spec } }, path, spec, groups: [], middlewares: mw, excludeFromMw: [] };
}

beforeEach(() => {
  RouterCollection.paths = {};
  (Authentication as any).$drivers = {};
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
  (globalThis as any).$app = { $modules: { RouterModule: { routers: [router] } } };
});
afterEach(() => {
  (globalThis as any).$app = prevApp;
});

describe("RouterCollection.init", () => {
  it("converts :param paths to {param} and includes only spec'd endpoints", async () => {
    await new RouterCollection().init({ security: [{ bearerAuth: [] }] } as any);
    expect(Object.keys(RouterCollection.paths).sort()).toEqual(["/api/users/signin", "/api/users/{id}"]);
  });

  it("marks a protected endpoint with the global security and x-middlewares", async () => {
    await new RouterCollection().init({ security: [{ bearerAuth: [] }] } as any);
    const op: any = RouterCollection.paths["/api/users/{id}"].get;
    expect(op.summary).toBe("get user");
    expect(op.tags).toEqual(["Users"]);
    expect(op.security).toEqual([{ bearerAuth: [] }]);
    expect(op["x-middlewares"]).toEqual(["auth"]);
  });

  it("marks an AuthRouteException endpoint as public (security: [])", async () => {
    await new RouterCollection().init({ security: [{ bearerAuth: [] }] } as any);
    const op: any = RouterCollection.paths["/api/users/signin"].post;
    expect(op.security).toEqual([]);
  });
});
