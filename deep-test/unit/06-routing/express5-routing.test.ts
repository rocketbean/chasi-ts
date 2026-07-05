/**
 * Phase 6 — Express-5 routing through chasi's Consumer.
 *
 * Express 5 swapped path-to-regexp to v8, which is a breaking point:
 *   - bare "*" / "/*" route patterns now THROW ("Missing parameter name")
 *   - the named wildcard "/*splat" does NOT match the root "/"
 *   - the OPTIONAL wildcard "/{*splat}" matches "/" AND everything below
 *
 * These tests pin, against a real express app + supertest:
 *   1. multiple routers consumed onto one app dispatch by prefix
 *   2. every common HTTP verb routes to its handler (and wrong verb 404s)
 *   3. wildcard routes match nested paths and capture the splat
 *   4. a ROOT catch-all "/{*splat}" catches "/" (the express-5 footgun)
 *   5. legacy "*" patterns throw (the breaking change, documented)
 */
import { describe, it, expect, beforeAll, vi } from "vitest";
import request from "supertest";
import "../../harness/globals.ts";
// Import App first to resolve the App→Consumer→Handler import cycle.
import "../../../src/package/framework/Server/App.js";
import Consumer, { toExpressPath } from "../../../src/package/framework/Server/Consumer.js";
import Endpoint from "../../../src/package/framework/Router/Endpoint.js";
import Exception from "../../../src/package/framework/ErrorHandler/Exception.js";

beforeAll(async () => {
  await Exception.init({ emit: vi.fn() } as any);
});

function makeEndpoint(method: string, path: string, handler: Function) {
  const ep: any = new Endpoint(
    { method, controller: () => {}, endpoint: path.slice(1), options: {} } as any,
    [],
  );
  ep.path = path;
  ep.useAuth = (_q: any, _s: any, n: any) => n();
  ep.$middlewares = [];
  ep.isDynamic = false;
  ep.beforeFns = [];
  ep.afterFns = [];
  ep.$method = handler;
  return ep;
}

const router = (...eps: any[]) => ({ $registry: { routes: eps }, property: {} }) as any;

describe("express-5 routing › multiple routers on one app", () => {
  it("dispatches each request to the router that owns its prefix", async () => {
    const consumer = new Consumer({} as any);
    await consumer.consume(router(makeEndpoint("get", "/api/ping", async () => ({ from: "api" }))));
    await consumer.consume(router(makeEndpoint("get", "/admin/ping", async () => ({ from: "admin" }))));
    // a third router whose route lives at the root prefix
    await consumer.consume(router(makeEndpoint("get", "/", async () => ({ from: "root" }))));

    expect((await request(consumer.$server).get("/api/ping")).body).toEqual({ from: "api" });
    expect((await request(consumer.$server).get("/admin/ping")).body).toEqual({ from: "admin" });
    expect((await request(consumer.$server).get("/")).body).toEqual({ from: "root" });
    expect((await request(consumer.$server).get("/nowhere")).status).toBe(404);
  });
});

describe("express-5 routing › HTTP verbs", () => {
  it.each(["get", "post", "put", "patch", "delete"])(
    "routes the %s verb to its handler",
    async (verb) => {
      const consumer = new Consumer({} as any);
      await consumer.consume(router(makeEndpoint(verb, "/resource", async () => ({ verb }))));
      const res = await (request(consumer.$server) as any)[verb]("/resource");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ verb });
    },
  );

  it("does not dispatch a route to the wrong verb", async () => {
    const consumer = new Consumer({} as any);
    await consumer.consume(router(makeEndpoint("post", "/only-post", async () => ({ ok: true }))));
    expect((await request(consumer.$server).post("/only-post")).status).toBe(200);
    expect((await request(consumer.$server).get("/only-post")).status).toBe(404);
  });
});

describe("express-5 routing › wildcards", () => {
  it("matches a named wildcard route across nested paths and captures the splat", async () => {
    const consumer = new Consumer({} as any);
    await consumer.consume(
      router(makeEndpoint("get", "/files/{*splat}", async (req: any) => ({ splat: req.params.splat }))),
    );
    const res = await request(consumer.$server).get("/files/a/b/c.txt");
    expect(res.status).toBe(200);
    // path-to-regexp v8 captures the wildcard as the matched path segments
    expect([].concat(res.body.splat).join("/")).toBe("a/b/c.txt");
  });

  it("a ROOT catch-all '/{*splat}' catches '/' AND nested paths", async () => {
    // This is the express-5 footgun: "/*splat" would MISS "/". The optional
    // form "/{*splat}" (used by chasi's SSR catch-alls) catches the root too.
    const consumer = new Consumer({} as any);
    await consumer.consume(router(makeEndpoint("get", "/{*splat}", async () => ({ caught: true }))));
    for (const p of ["/", "/x", "/x/y/z"]) {
      const res = await request(consumer.$server).get(p);
      expect(res.status, `path ${p} should be caught`).toBe(200);
      expect(res.body).toEqual({ caught: true });
    }
  });

});

describe("express-5 routing › legacy wildcard auto-translation", () => {
  it("toExpressPath migrates legacy '*' patterns to express-5 named wildcards", () => {
    expect(toExpressPath("*")).toBe("/{*splat0}");
    expect(toExpressPath("/*")).toBe("/{*splat0}");
    expect(toExpressPath("/files/*")).toBe("/files/{*splat0}");
    expect(toExpressPath("/users/:id")).toBe("/users/:id"); // no wildcard → untouched
    expect(toExpressPath("/{*splat}")).toBe("/{*splat}"); // already migrated → untouched
  });

  it("a route defined with a legacy bare '*' is auto-translated and catches '/' + nested", async () => {
    // Raw express 5 would THROW on "*"; chasi's Consumer shields user apps by
    // translating it to the root-matching "/{*splat0}".
    const consumer = new Consumer({} as any);
    await consumer.consume(router(makeEndpoint("get", "*", async () => ({ caught: true }))));
    for (const p of ["/", "/x", "/x/y"]) {
      const res = await request(consumer.$server).get(p);
      expect(res.status, `path ${p}`).toBe(200);
      expect(res.body).toEqual({ caught: true });
    }
  });

  it("a legacy prefixed wildcard '/legacy/*' is auto-translated", async () => {
    const consumer = new Consumer({} as any);
    await consumer.consume(router(makeEndpoint("get", "/legacy/*", async () => ({ ok: true }))));
    expect((await request(consumer.$server).get("/legacy/a/b")).status).toBe(200);
    expect((await request(consumer.$server).get("/other")).status).toBe(404);
  });
});

describe("express-5 routing › controller returns & errors handled by chasi (not express)", () => {
  // chasi wraps every controller in Consumer's own try/catch and serializes the
  // return value itself. Express 5's async auto-error-forwarding never engages,
  // and return values are NOT auto-sent — chasi does both explicitly.
  it("serializes a controller's return value to the response", async () => {
    const consumer = new Consumer({} as any);
    await consumer.consume(router(makeEndpoint("get", "/returns", async () => ({ hello: "world" }))));
    const res = await request(consumer.$server).get("/returns");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ hello: "world" });
  });

  it("catches a controller that throws a plain Error and responds 500 (no try/catch in the controller)", async () => {
    (Consumer as any)._defaultResponses = { 500: "server error", message: "error" };
    const consumer = new Consumer({} as any);
    await consumer.consume(
      router(makeEndpoint("get", "/throws", async () => { throw new Error("boom"); })),
    );
    const res = await request(consumer.$server).get("/throws");
    expect(res.status).toBe(500); // chasi's handleError, not express's auto-forwarder
  });

  it("maps a thrown { status, message } to that status", async () => {
    (Consumer as any)._defaultResponses = { 422: "bad", message: "error" };
    const consumer = new Consumer({} as any);
    await consumer.consume(
      router(makeEndpoint("post", "/explicit", async () => { throw { status: 422, message: "nope" }; })),
    );
    const res = await request(consumer.$server).post("/explicit");
    expect(res.status).toBe(422);
  });
});
