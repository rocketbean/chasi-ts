/**
 * Phase 2 — config/types.ts.
 *
 * This file is type-only (a set of `export type` interfaces consumed by the other
 * config files). It carries no runtime value, so the coverage here is a load smoke:
 * importing it must not throw and it must contribute no runtime exports.
 */
import { describe, it, expect } from "vitest";
import "../../harness/globals.ts";
import * as types from "../../../src/config/types.js";

describe("config/types", () => {
  it("imports without throwing and exposes no runtime values", () => {
    expect(types).toBeTypeOf("object");
    expect(Object.keys(types)).toHaveLength(0);
  });
});
