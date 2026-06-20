/**
 * Phase 9 — SdkBuilder RouteCollector (collect) + terser formatter (format).
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "../../harness/globals.ts";
import RouteCollector from "../../../src/container/modules/SdkBuilder/collectors/Routes.js";
import { terserFormatter } from "../../../src/container/modules/SdkBuilder/formatters/terser.js";
import Authentication from "../../../src/package/framework/Server/Authentication.js";

const prevApp = (globalThis as any).$app;

function ep(method: string, path: string, mw: string[] = []) {
  return { property: { method }, path, spec: {}, $sdkHandlers: [], middlewares: mw, excludeFromMw: [] };
}

beforeEach(() => {
  RouteCollector.entries = [];
  (Authentication as any).$drivers = {};
  const api = {
    property: { name: "api", auth: "dev", prefix: "/api", AuthRouteExceptions: [{ url: "/api/users/signin", m: "post" }] },
    $registry: {
      routes: [
        ep("get", "/api/users/:user", ["auth"]),
        ep("post", "/api/users/signin"),
        ep("post", "/api/users/forget"),
        ep("post", "/api/users/pg-signup"),
      ],
    },
  };
  const admin = { property: { name: "admin", auth: false, prefix: "/admin" }, $registry: { routes: [ep("get", "/admin/x")] } };
  (globalThis as any).$app = { $modules: { RouterModule: { routers: [api, admin] } } };
});
afterEach(() => {
  (globalThis as any).$app = prevApp;
});

describe("SdkBuilder RouteCollector.init", () => {
  it("collects only the configured routers and skips excluded routes", async () => {
    await new RouteCollector().init({ routers: ["api"], exclude: [{ m: "post", url: "/api/users/forget" }] } as any);
    const paths = RouteCollector.entries.map((e) => e.path);
    expect(paths).toContain("/api/users/:user");
    expect(paths).toContain("/api/users/signin");
    expect(paths).not.toContain("/api/users/forget"); // excluded
    expect(paths.some((p) => p.startsWith("/admin"))).toBe(false); // router filtered out
  });

  it("marks protected vs public and derives namespace/function names", async () => {
    await new RouteCollector().init({ routers: ["api"], exclude: [] } as any);
    const signin = RouteCollector.entries.find((e) => e.path === "/api/users/signin")!;
    expect(signin.isProtected).toBe(false); // AuthRouteException
    expect(signin.namespace).toEqual(["users"]);
    expect(signin.functionName).toBe("signin");

    const protectedEp = RouteCollector.entries.find((e) => e.path === "/api/users/:user")!;
    expect(protectedEp.isProtected).toBe(true);
    expect(protectedEp.middlewares).toEqual(["auth"]);

    const camel = RouteCollector.entries.find((e) => e.path === "/api/users/pg-signup")!;
    expect(camel.functionName).toBe("pgSignup");
  });
});

describe("terserFormatter", () => {
  it("minifies the input code into a shorter string", async () => {
    const src = "const greeting = 'hello world';\nfunction announce() {\n  return greeting + '!';\n}\n";
    const out = await terserFormatter(src);
    expect(typeof out).toBe("string");
    expect(out.length).toBeLessThan(src.length);
    expect(out).not.toContain("\n  ");
  });
});
