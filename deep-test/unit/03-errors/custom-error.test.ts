/**
 * Phase 3 — container/errors/CustomError.ts.
 */
import { describe, it, expect } from "vitest";
import "../../harness/globals.ts";
import CustomError from "../../../src/container/errors/CustomError.js";

describe("CustomError", () => {
  it("defaults status to 500", () => {
    const e = new CustomError("boom");
    expect(e.status).toBe(500);
    expect(e.message).toBe("boom");
  });

  it("honors an explicit status", () => {
    expect(new CustomError("nope", 422).status).toBe(422);
    expect(new CustomError("auth", 401).status).toBe(401);
  });

  it("falls back to 500 for a falsy status (0)", () => {
    expect(new CustomError("zero", 0).status).toBe(500);
  });

  it("is a real Error subclass", () => {
    const e = new CustomError("x", 404);
    expect(e).toBeInstanceOf(Error);
    expect(e).toBeInstanceOf(CustomError);
  });
});
