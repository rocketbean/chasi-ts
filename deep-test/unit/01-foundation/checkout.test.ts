/**
 * Phase 1 — `checkout(val, backup)` global (src/package/helper.ts).
 *
 * Behavior pinned to 4.1.2:
 *   checkout = (val, backup) => (val == undefined || val == null) ? backup : val;
 * Note the loose `==`: only `undefined`/`null` fall through to the backup.
 * Other falsy-but-defined values ("", 0, false, NaN) are returned as-is.
 */
import { describe, it, expect, beforeAll } from "vitest";
import "../../harness/globals.ts";
import ready from "../../../src/package/helper.js";

const checkout = (globalThis as any).checkout as (v: any, b: any) => any;

describe("helper › checkout", () => {
  beforeAll(async () => {
    await ready; // ensure helper IIFE fully resolved
  });

  it("is installed as a global function", () => {
    expect(typeof checkout).toBe("function");
  });

  it("returns the value when it is defined", () => {
    expect(checkout("value", "backup")).toBe("value");
    expect(checkout(42, 0)).toBe(42);
    const obj = { a: 1 };
    expect(checkout(obj, {})).toBe(obj);
  });

  it("falls back to backup for undefined and null", () => {
    expect(checkout(undefined, "backup")).toBe("backup");
    expect(checkout(null, "backup")).toBe("backup");
    let notPassed: any;
    expect(checkout(notPassed, "default")).toBe("default");
  });

  it("does NOT fall back for falsy-but-defined values (loose == semantics)", () => {
    // These are the edge cases the framework relies on for env parsing.
    expect(checkout("", "backup")).toBe("");
    expect(checkout(0, 99)).toBe(0);
    expect(checkout(false, true)).toBe(false);
    expect(Number.isNaN(checkout(NaN, "backup"))).toBe(true);
  });

  it("supports an undefined backup", () => {
    expect(checkout(undefined, undefined)).toBeUndefined();
  });
});
