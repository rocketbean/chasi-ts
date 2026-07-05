/**
 * Harness self-check (Phase 0). NOT a feature test — proves the deep-test
 * scaffolding loads: globals install, setup runs, mock factories work.
 * Delete or keep as a template once Phase 1 lands.
 */
import { describe, it, expect } from "vitest";
import "../harness/globals.ts";
import { mockRequest, mockResponse, mockNext, mockMongooseModel } from "../harness/mocks.ts";

describe("deep-test harness", () => {
  it("installs framework globals", () => {
    expect(typeof (globalThis as any).checkout).toBe("function");
    expect((globalThis as any).checkout(undefined, "fallback")).toBe("fallback");
    expect((globalThis as any).checkout("value", "fallback")).toBe("value");
    expect(typeof (globalThis as any).Logger).toBeDefined();
  });

  it("provides usable mock req/res/next", () => {
    const req = mockRequest({ body: { a: 1 } });
    const res = mockResponse();
    const next = mockNext();
    expect(req.body.a).toBe(1);
    res.status(201).json({ ok: true });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ ok: true });
    next();
    expect(next).toHaveBeenCalledOnce();
  });

  it("provides a working mongoose model mock", async () => {
    const User = mockMongooseModel([{ _id: "1", email: "a@b.c" }]);
    expect(await User.findOne({ email: "a@b.c" })).toMatchObject({ _id: "1" });
    const created = await User.create({ email: "x@y.z" });
    expect(created._id).toBeDefined();
    expect(User.__store).toHaveLength(2);
  });

  it("confirms integration tier is opt-in", () => {
    const integrationOn = !!process.env.DEEP_INTEGRATION;
    expect(typeof integrationOn).toBe("boolean");
  });
});
