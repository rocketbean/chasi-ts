/**
 * Phase 12 — `postbuild` script integrity (cpy-cli).
 *
 * `postbuild` does two copies that prod relies on:
 *   1. the SSR frontend  src/container/html  → dist/container/html
 *      In prod the compiler resolves its engine roots from the RUN dir (dist),
 *      i.e. dist/container/html/<engine>; if this copy is missing or flattened
 *      the Vite build can't find index.html/ssr.config.js and the compiler fails.
 *   2. a generated Prisma client  src/container/prisma/client → dist/...
 *      preserving structure, and tolerating its absence (the default app).
 *
 * This guards the cpy-cli v7 migration (v7 errors on no-match and dropped
 * `--parents`; a stray trailing space in the glob also broke it). Opt-in:
 * DEEP_INTEGRATION=1 — shells out to `npm run postbuild` and writes under dist/.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const RUN = !!process.env.DEEP_INTEGRATION;
const root = process.cwd();
const distHtml = path.join(root, "dist/container/html");
const prismaSrc = path.join(root, "src/container/prisma/client");
const prismaDist = path.join(root, "dist/container/prisma/client");

const postbuild = () => execSync("npm run postbuild", { cwd: root, stdio: "pipe" });

describe.skipIf(!RUN)("integration › postbuild script", () => {
  describe("SSR frontend copy (so the prod compiler can find it)", () => {
    beforeAll(() => {
      fs.rmSync(distHtml, { recursive: true, force: true });
      postbuild();
    });

    it("copies the engine's index.html and ssr.config.js into dist", () => {
      expect(fs.existsSync(path.join(distHtml, "web/index.html"))).toBe(true);
      expect(fs.existsSync(path.join(distHtml, "web/ssr.config.js"))).toBe(true);
      expect(fs.existsSync(path.join(distHtml, "web/entry-server.js"))).toBe(true);
    });

    it("preserves nested directory structure (not flattened)", () => {
      expect(fs.existsSync(path.join(distHtml, "web/src"))).toBe(true);
    });
  });

  describe("Prisma client copy (optional)", () => {
    afterAll(() => {
      fs.rmSync(prismaSrc, { recursive: true, force: true });
      fs.rmSync(prismaDist, { recursive: true, force: true });
    });

    it("succeeds when no Prisma client exists (default app — tolerant of no-match)", () => {
      fs.rmSync(prismaSrc, { recursive: true, force: true });
      expect(() => postbuild()).not.toThrow();
    });

    it("copies a generated Prisma client into dist, preserving structure", () => {
      fs.mkdirSync(path.join(prismaSrc, "runtime"), { recursive: true });
      fs.writeFileSync(path.join(prismaSrc, "index.js"), "export const x = 1;");
      fs.writeFileSync(path.join(prismaSrc, "runtime/lib.js"), "export const r = 2;");
      fs.rmSync(prismaDist, { recursive: true, force: true });

      postbuild();

      expect(fs.existsSync(path.join(prismaDist, "index.js"))).toBe(true);
      expect(fs.existsSync(path.join(prismaDist, "runtime/lib.js"))).toBe(true);
    });
  });
});
