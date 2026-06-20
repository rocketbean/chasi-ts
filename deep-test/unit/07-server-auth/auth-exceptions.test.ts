/**
 * Phase 7 — AuthRouteExceptions bypass the JWT guard.
 */
import { describe, it, expect, vi } from "vitest";
import "../../harness/globals.ts";
import JWTDriver from "../../../src/package/framework/Server/AuthDrivers/jwt.js";

function makeReqRes() {
  const req: any = { header: () => undefined }; // no token at all
  const res: any = { status: vi.fn(() => res), send: vi.fn(() => res) };
  return { req, res };
}

describe("JWTDriver › route exceptions", () => {
  it("skips verification for a matching {url,m} exception", async () => {
    const driver = new JWTDriver({ key: "k", model: "user", AuthRouteExceptions: [] } as any);
    const ep: any = { path: "/login", property: { method: "post" } };
    const exceptions = [{ url: "/login", m: "post" }];
    const { req, res } = makeReqRes();
    const next = vi.fn();
    await driver.authorize(ep, exceptions)(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(req.auth).toBeUndefined();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("still guards a non-matching route (no token → 401)", async () => {
    const driver = new JWTDriver({ key: "k", model: "user", AuthRouteExceptions: [] } as any);
    const ep: any = { path: "/secret", property: { method: "get" } };
    const exceptions = [{ url: "/login", m: "post" }];
    const { req, res } = makeReqRes();
    const next = vi.fn();
    await driver.authorize(ep, exceptions)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
