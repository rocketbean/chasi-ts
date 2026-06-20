/**
 * Phase 6 — controller return value + $data accessor.
 *
 * A controller method simply RETURNS its payload; turning that return value into
 * an HTTP response (res.json) is the Consumer's job (Phase 7). Here we pin the
 * controller-side contract: the value is returned as-is, and $data round-trips.
 */
import { describe, it, expect } from "vitest";
import "../../harness/globals.ts";
import Controller from "../../../src/package/statics/Controller.js";
import BaseController from "../../../src/package/framework/Router/Controller.js";

class TestController extends Controller {
  async handle(req: any) {
    return { ok: true, echo: req.body };
  }
}

describe("controller return value", () => {
  it("returns its payload to the caller (no res needed)", async () => {
    const out = await new TestController().handle({ body: { a: 1 } });
    expect(out).toEqual({ ok: true, echo: { a: 1 } });
  });
});

describe("Controller.$data accessor", () => {
  it("is undefined by default and round-trips a data provider", () => {
    const c = new BaseController() as any;
    expect(c.$data).toBeUndefined();
    c.$data = () => ({ requestId: "abc" });
    expect(c.$data).toEqual({ requestId: "abc" });
  });
});
