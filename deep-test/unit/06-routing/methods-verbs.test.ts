/**
 * Phase 6 — HTTP verb coverage (Methods/methods.ts marker classes + Route verbs).
 */
import { describe, it, expect } from "vitest";
import "../../harness/globals.ts";
import methods from "../../../src/package/framework/Router/Methods/methods.js";
import Registry from "../../../src/package/framework/Router/Registry.js";
import Route from "../../../src/package/framework/Router/Route.js";

function makeRoute() {
  return new Route(new Registry({ prefix: "x", auth: null, AuthRouteExceptions: [] } as any));
}

describe("Methods registry", () => {
  it("exports a marker class for every supported verb", () => {
    expect(Object.keys(methods)).toEqual(
      expect.arrayContaining(["Get", "Post", "Options", "Patch", "Put", "Search", "Delete"]),
    );
  });
});

describe("Route verbs", () => {
  it.each(["get", "post", "put", "patch", "delete", "options", "search"])(
    "route.%s registers an endpoint with that method",
    (verb) => {
      const route: any = makeRoute();
      const ep = route[verb]("path", "C@m");
      expect(ep.property.method).toBe(verb);
    },
  );

  it("route.dynamic marks the endpoint as unmatched", () => {
    const route: any = makeRoute();
    const ep = route.dynamic("path", "C@m", "get");
    expect(ep.unmatched).toBe(true);
    expect(ep.property.method).toBe("get");
  });
});
