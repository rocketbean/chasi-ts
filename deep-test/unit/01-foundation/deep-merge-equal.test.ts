/**
 * Phase 1 — __deepEqual and __deepMerge globals (src/package/helper.ts).
 *
 * These two are assigned AFTER an `await` inside the helper IIFE, so the suite
 * awaits the helper's default export before touching them.
 *
 * IMPORTANT (pinned to 4.1.2 actual behavior, not the plan's wishlist):
 *   - __deepMerge MUTATES `target` in place (it is NOT immutable).
 *   - isObject() treats arrays as non-objects, so array values are REPLACED,
 *     not merged element-wise.
 */
import { describe, it, expect, beforeAll } from "vitest";
import "../../harness/globals.ts";
import ready from "../../../src/package/helper.js";

const g = globalThis as any;

describe("helper › __deepEqual / __deepMerge", () => {
  beforeAll(async () => {
    await ready;
  });

  describe("__deepEqual", () => {
    it("is true for shallow-equal objects", () => {
      expect(g.__deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    });

    it("is true for nested-equal objects", () => {
      expect(g.__deepEqual({ a: { b: { c: 1 } } }, { a: { b: { c: 1 } } })).toBe(true);
    });

    it("is true for equal arrays (compared by index keys)", () => {
      expect(g.__deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(g.__deepEqual([{ a: 1 }], [{ a: 1 }])).toBe(true);
    });

    it("is false when a leaf value differs", () => {
      expect(g.__deepEqual({ a: 1 }, { a: 2 })).toBe(false);
      expect(g.__deepEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
      expect(g.__deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    });

    it("is false when key counts differ", () => {
      expect(g.__deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });
  });

  describe("__deepMerge", () => {
    it("merges disjoint shallow keys into target", () => {
      const target = { a: 1 };
      const result = g.__deepMerge(target, { b: 2 });
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it("deep-merges nested objects", () => {
      const result = g.__deepMerge({ a: { x: 1 } }, { a: { y: 2 } });
      expect(result).toEqual({ a: { x: 1, y: 2 } });
    });

    it("returns target unchanged when no sources are given", () => {
      const target = { a: 1 };
      expect(g.__deepMerge(target)).toBe(target);
    });

    it("applies multiple sources left-to-right", () => {
      const result = g.__deepMerge({ a: 1 }, { b: 2 }, { a: 9, c: 3 });
      expect(result).toEqual({ a: 9, b: 2, c: 3 });
    });

    it("MUTATES the target object in place (documented actual behavior)", () => {
      const target = { a: 1 };
      const result = g.__deepMerge(target, { b: 2 });
      expect(result).toBe(target); // same reference
      expect(target).toEqual({ a: 1, b: 2 }); // target was changed
    });

    it("REPLACES array values rather than merging element-wise", () => {
      const result = g.__deepMerge({ list: [1, 2] }, { list: [3] });
      expect(result.list).toEqual([3]);
    });
  });
});
