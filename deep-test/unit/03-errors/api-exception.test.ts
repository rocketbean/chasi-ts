/**
 * Phase 3 — APIException (carries an HTTP status + the throwing endpoint).
 */
import { describe, it, expect, vi, beforeAll } from "vitest";
import "../../harness/globals.ts";
import Exception from "../../../src/package/framework/ErrorHandler/Exception.js";
import APIException from "../../../src/package/framework/ErrorHandler/exceptions/APIException.js";

const fakeEp = { controller: "UserController", method: "create" } as any;

beforeAll(async () => {
  await Exception.init({ emit: vi.fn() } as any);
});

describe("APIException", () => {
  it("maps the status argument and the message", () => {
    const ex = new APIException({ message: "unprocessable" }, 422, fakeEp);
    expect(ex).toBeInstanceOf(Exception);
    expect(ex.status).toBe(422);
    expect(ex.message).toBe("unprocessable");
  });

  it("defaults interpose to 2 (warn)", () => {
    expect(new APIException({ message: "api interpose default" }, 500, fakeEp).interpose).toBe(2);
  });

  it("lets property.interpose override the default", () => {
    expect(new APIException({ message: "api interpose override", interpose: 3 }, 500, fakeEp).interpose).toBe(3);
  });

  it("log() formats against the endpoint without throwing", () => {
    const ex = new APIException({ message: "boom" }, 400, fakeEp);
    expect(() => ex.log()).not.toThrow();
  });
});
