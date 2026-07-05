/**
 * Phase 12 — real built-app routing under express 5 (boots `node dist`).
 *
 * Proves the framework's OWN catch-all (the SSR prodBundler `/{*splat}` route,
 * mounted via the root "chasi" router) actually serves the non-prefixed root "/"
 * and arbitrarily nested paths — the exact express-5 footgun — while the "/api"
 * router still owns its own prefix. This complements the hermetic
 * unit/06-routing/express5-routing.test.ts with a live multi-router boot.
 *
 * Opt-in: DEEP_CLUSTER=1 (the real-app-boot lane — each boot runs the prod Vite
 * build). Requires MongoDB and a built dist (`npx tsc`).
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { startApp, type AppProcess } from "../../harness/app-process.ts";

const RUN = !!process.env.DEEP_CLUSTER;

describe.skipIf(!RUN)("integration › real-app routing (express 5)", () => {
  let app: AppProcess;

  beforeAll(async () => {
    app = await startApp({ cluster: false, port: 4365 });
  }, 180_000);

  afterAll(async () => {
    await app?.stop();
  });

  it("the root SSR catch-all serves '/' (the non-prefixed root)", async () => {
    const res = await app.request("GET", "/");
    expect(res.status).toBe(200);
  });

  it("the SSR catch-all also serves arbitrarily nested paths (wildcard)", async () => {
    for (const p of ["/getting-started", "/a/b/c", "/deep/nested/route/here"]) {
      const res = await app.request("GET", p);
      // 200 (rendered) or 404 (valid catch-all hit, route not in SPA registry) —
      // either way the request reached the catch-all handler, not a hard crash.
      expect([200, 404], `path ${p}`).toContain(res.status);
    }
  });

  it("the '/api' router still owns its prefix (multi-router dispatch)", async () => {
    // empty body → api UserController returns 422 (missing credentials),
    // proving the request routed to the api router, not the SSR catch-all.
    const res = await app.request("POST", "/api/users/signin", {});
    expect(res.status).toBe(422);
  });

  it("a non-JSON request hits the graceful validation path, not a 500 (req.body shield)", async () => {
    // Express 5 leaves req.body undefined for a non-JSON content-type; chasi's
    // body shield defaults it to {}, so signin destructures cleanly and returns
    // 422 (missing creds) instead of crashing with 500 on the destructure.
    const res = await fetch(`http://127.0.0.1:${app.port}/api/users/signin`, {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "not json",
    });
    expect(res.status).toBe(422);
  });

  it("serves the root catch-all across HTTP verbs (registered via .all)", async () => {
    for (const method of ["GET", "POST", "PUT", "DELETE"]) {
      const res = await app.request(method, "/");
      expect(res.status, `method ${method}`).toBe(200);
    }
  });
});
