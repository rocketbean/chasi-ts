/**
 * Phase 7 — container/middlewares/TestMode.mw.ts.
 * Active only during a test run (NODE_ENV === "test") — the danger-route guard.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import "../../harness/globals.ts";
import testModeMw from "../../../src/container/middlewares/TestMode.mw.js";

const prev = process.env.NODE_ENV;
afterEach(() => {
  if (prev === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = prev;
});

function makeRes() {
  const res: any = { status: vi.fn(() => res), send: vi.fn(() => res) };
  return res;
}

describe("TestMode middleware", () => {
  it("passes through during a test run (NODE_ENV=test)", async () => {
    process.env.NODE_ENV = "test";
    const res = makeRes();
    const next = vi.fn();
    await testModeMw({} as any, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 404 when not a test run", async () => {
    process.env.NODE_ENV = "production";
    const res = makeRes();
    const next = vi.fn();
    await testModeMw({} as any, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });
});
