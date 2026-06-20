/**
 * Phase 3 — SocketException (status + originating socket router).
 * Its log() body is commented out in 4.1.2, so it is a no-op by design.
 */
import { describe, it, expect, vi, beforeAll } from "vitest";
import "../../harness/globals.ts";
import Exception from "../../../src/package/framework/ErrorHandler/Exception.js";
import SocketException from "../../../src/package/framework/ErrorHandler/exceptions/SocketException.js";

const fakeRouter = { name: "web" } as any;

beforeAll(async () => {
  await Exception.init({ emit: vi.fn() } as any);
});

describe("SocketException", () => {
  it("maps the status argument and message", () => {
    const ex = new SocketException({ message: "bad frame" }, 400, fakeRouter);
    expect(ex).toBeInstanceOf(Exception);
    expect(ex.status).toBe(400);
    expect(ex.message).toBe("bad frame");
  });

  it("defaults interpose to 2 and honors an override", () => {
    expect(new SocketException({ message: "socket interpose default" }, 500, fakeRouter).interpose).toBe(2);
    expect(new SocketException({ message: "socket interpose override", interpose: 5 }, 500, fakeRouter).interpose).toBe(5);
  });

  it("log() is a no-op and does not throw", () => {
    const ex = new SocketException({ message: "socket noop log" }, 400, fakeRouter);
    expect(() => ex.log()).not.toThrow();
  });
});
