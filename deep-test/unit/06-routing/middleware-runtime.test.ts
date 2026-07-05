/**
 * Phase 6/7 — middleware RUNTIME behavior under express 5.
 *
 * The wiring (which functions land in ep.$middlewares, exclusion via
 * excludeFromMw, group propagation) is covered by middleware-except / group-
 * middleware. This pins that the wired middleware actually EXECUTES as expected
 * in the express-5 request pipeline, via a real express app + supertest:
 *   - order: useAuth → $middlewares → handler
 *   - a middleware that responds without next() short-circuits the handler
 *   - a throwing middleware completes (express 5 forwards it) — does NOT hang
 *   - an excluded middleware never runs end-to-end
 */
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import request from "supertest";
import "../../harness/globals.ts";
// Import App first to resolve the App→Consumer→Handler import cycle.
import "../../../src/package/framework/Server/App.js";
import Consumer from "../../../src/package/framework/Server/Consumer.js";
import Endpoint from "../../../src/package/framework/Router/Endpoint.js";
import Registry from "../../../src/package/framework/Router/Registry.js";
import Router from "../../../src/package/framework/Router/Router.js";
import Exception from "../../../src/package/framework/ErrorHandler/Exception.js";

beforeAll(async () => {
  await Exception.init({ emit: vi.fn() } as any);
});

function endpoint(opts: {
  method?: string;
  path?: string;
  useAuth?: Function;
  mws?: Function[];
  handler?: Function;
}) {
  const method = opts.method ?? "get";
  const path = opts.path ?? "/x";
  const ep: any = new Endpoint(
    { method, controller: () => {}, endpoint: path.slice(1), options: {} } as any,
    [],
  );
  ep.path = path;
  ep.useAuth = opts.useAuth ?? ((_q: any, _s: any, n: any) => n());
  ep.$middlewares = opts.mws ?? [];
  ep.isDynamic = false;
  ep.beforeFns = [];
  ep.afterFns = [];
  ep.$method = opts.handler ?? (async () => ({ ok: true }));
  return ep;
}

const router = (ep: any) => ({ $registry: { routes: [ep] }, property: {} }) as any;

describe("middleware runtime › execution order", () => {
  it("runs useAuth, then $middlewares, then the handler — in order", async () => {
    const trace: string[] = [];
    const consumer = new Consumer({} as any);
    await consumer.consume(
      router(
        endpoint({
          path: "/order",
          useAuth: (_q: any, _s: any, n: any) => { trace.push("auth"); n(); },
          mws: [
            (_q: any, _s: any, n: any) => { trace.push("mw1"); n(); },
            (_q: any, _s: any, n: any) => { trace.push("mw2"); n(); },
          ],
          handler: async () => { trace.push("handler"); return { trace }; },
        }),
      ),
    );
    const res = await request(consumer.$server).get("/order");
    expect(res.body.trace).toEqual(["auth", "mw1", "mw2", "handler"]);
  });
});

describe("middleware runtime › short-circuit", () => {
  it("a middleware that responds without next() prevents the handler from running", async () => {
    let handlerRan = false;
    const consumer = new Consumer({} as any);
    await consumer.consume(
      router(
        endpoint({
          path: "/guard",
          mws: [(_q: any, res: any) => { res.status(403).send("blocked"); }],
          handler: async () => { handlerRan = true; return { ok: true }; },
        }),
      ),
    );
    const res = await request(consumer.$server).get("/guard");
    expect(res.status).toBe(403);
    expect(res.text).toBe("blocked");
    expect(handlerRan).toBe(false);
  });
});

describe("middleware runtime › error handling (express 5)", () => {
  it("a throwing async middleware completes the request (no hang) instead of stalling", async () => {
    const consumer = new Consumer({} as any);
    await consumer.consume(
      router(
        endpoint({
          path: "/mwthrows",
          mws: [async () => { throw new Error("mw boom"); }],
          handler: async () => ({ reached: true }),
        }),
      ),
    );
    // In express 4 an async-rejecting middleware that never calls next() would
    // hang; express 5 forwards it, so the request resolves with an error status.
    const res = await request(consumer.$server).get("/mwthrows");
    expect(res.status).toBeGreaterThanOrEqual(500);
  });
});

describe("middleware runtime › exclusion end-to-end", () => {
  beforeEach(() => {
    Router.Middlewares = {
      keep: (_q: any, _s: any, n: any) => n(),
      drop: (_q: any, _s: any, n: any) => n(),
    } as any;
  });

  it("an excluded middleware (except) is never executed at request time", async () => {
    const ran: string[] = [];
    Router.Middlewares = {
      keep: (_q: any, _s: any, n: any) => { ran.push("keep"); n(); },
      drop: (_q: any, _s: any, n: any) => { ran.push("drop"); n(); },
    } as any;
    const registry = new Registry({ prefix: "x", auth: null, AuthRouteExceptions: [] } as any);
    const ep = endpoint({ path: "/excl", handler: async () => ({ ran }) });
    ep.middleware(["keep", "drop"]);
    ep.except("drop");
    await registry.bindMiddlewares(ep); // resolves $middlewares to [keep] only

    const consumer = new Consumer({} as any);
    await consumer.consume(router(ep));
    const res = await request(consumer.$server).get("/excl");
    expect(res.body.ran).toEqual(["keep"]); // "drop" was excluded → never ran
  });
});
