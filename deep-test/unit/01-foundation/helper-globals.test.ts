/**
 * Phase 1 — global helpers installed by src/package/helper.ts (excluding checkout
 * and the deep-* utilities, which have dedicated files).
 *
 * Covers: __testMode, _getMethods, __getRandomStr, __getRandomNum, the path refs
 * (___location / __devDirname / __filepath / __devFilepath) and that Logger + Caveat
 * are installed.
 */
import { describe, it, expect, beforeAll, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import "../../harness/globals.ts";
import ready from "../../../src/package/helper.js";

const g = globalThis as any;

describe("helper › globals", () => {
  beforeAll(async () => {
    await ready;
  });

  describe("__testMode", () => {
    const prev = process.env["testMode"];
    afterEach(() => {
      if (prev === undefined) delete process.env["testMode"];
      else process.env["testMode"] = prev;
    });

    it("is true only when process.env.testMode === 'enabled'", () => {
      process.env["testMode"] = "enabled";
      expect(g.__testMode()).toBe(true);
    });

    it("is false for any other value or when unset", () => {
      process.env["testMode"] = "disabled";
      expect(g.__testMode()).toBe(false);
      delete process.env["testMode"];
      expect(g.__testMode()).toBe(false);
    });
  });

  describe("_getMethods", () => {
    it("enumerates own property names of the given object", () => {
      const names = g._getMethods({ a: 1, b: 2, c: 3 });
      expect(names).toEqual(expect.arrayContaining(["a", "b", "c"]));
      expect(names).toHaveLength(3);
    });

    it("reads prototype method names when handed a prototype", () => {
      class Sample {
        foo() {}
        bar() {}
      }
      const names = g._getMethods(Sample.prototype);
      expect(names).toEqual(expect.arrayContaining(["constructor", "foo", "bar"]));
    });
  });

  describe("__getRandomStr", () => {
    it("returns a string of the requested length", () => {
      expect(g.__getRandomStr(0)).toBe("");
      expect(g.__getRandomStr(8)).toHaveLength(8);
      expect(g.__getRandomStr(32)).toHaveLength(32);
    });

    it("only uses the alphanumeric charset", () => {
      for (let i = 0; i < 50; i++) {
        expect(g.__getRandomStr(16)).toMatch(/^[A-Za-z0-9]+$/);
      }
    });
  });

  describe("__getRandomNum", () => {
    it("stays within the inclusive [min, max] bounds", () => {
      for (let i = 0; i < 500; i++) {
        const n = g.__getRandomNum(5, 10);
        expect(n).toBeGreaterThanOrEqual(5);
        expect(n).toBeLessThanOrEqual(10);
        expect(Number.isInteger(n)).toBe(true);
      }
    });

    it("returns min when min === max", () => {
      expect(g.__getRandomNum(7, 7)).toBe(7);
    });

    it("can produce both endpoints", () => {
      const seen = new Set<number>();
      for (let i = 0; i < 2000; i++) seen.add(g.__getRandomNum(0, 1));
      expect(seen.has(0)).toBe(true);
      expect(seen.has(1)).toBe(true);
    });
  });

  describe("path references", () => {
    it.each(["___location", "__devDirname", "__filepath", "__devFilepath"])(
      "%s is an absolute path",
      (name) => {
        expect(typeof g[name]).toBe("string");
        expect(path.isAbsolute(g[name])).toBe(true);
      },
    );

    it("___location and __filepath point at an existing directory", () => {
      expect(fs.existsSync(g.___location)).toBe(true);
      expect(fs.existsSync(g.__filepath)).toBe(true);
    });
  });

  describe("framework singletons", () => {
    it("installs a usable Logger global", () => {
      expect(g.Logger).toBeDefined();
      expect(typeof g.Logger.log).toBe("function");
      expect(typeof g.Logger.writer).toBe("function");
    });

    it("installs the Caveat exception handler global", () => {
      expect(g.Caveat).toBeDefined();
      expect(typeof g.Caveat).toBe("object");
    });
  });
});
