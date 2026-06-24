/**
 * Phase 1 — importSpecifier (src/package/Base.ts): the path→`import()` specifier
 * resolver used by every dynamic loader on Base.
 *
 * Background: chasi-ts loads controllers/models/providers/routes/config via
 * dynamic `import()`. On Windows a raw absolute path (`C:\…`) is rejected by the
 * ESM loader (`ERR_UNSUPPORTED_ESM_URL_SCHEME`), so it must be handed a
 * `file://` URL. On POSIX (macOS/Linux) a raw path is the correct specifier —
 * converting it to a `file://` URL percent-encodes spaces (`%20`), which Vite's
 * loader (used by Vitest) fails to resolve, breaking any project whose path
 * contains a space.
 *
 * `importSpecifier(p, platform?)` therefore branches on platform. The optional
 * `platform` arg lets us exercise each OS branch from a single host.
 *
 * NOTE: Node's `pathToFileURL` is bound to the *host* OS, so a real `C:\…` drive
 * path cannot be byte-for-byte converted on a non-Windows host. The Windows
 * cases therefore assert the *contract* (a loader-safe `file://` URL is produced
 * and decodes back to the input); exact URL shapes are checked with POSIX-form
 * inputs that the host can convert faithfully.
 */
import { describe, it, expect, beforeAll } from "vitest";
import "../../harness/globals.ts";
import ready from "../../../src/package/helper.js";
import { importSpecifier } from "../../../src/package/Base.js";
import { fileURLToPath } from "url";

beforeAll(async () => {
  await ready;
});

// ── macOS (darwin) ────────────────────────────────────────────────────────────
// POSIX: the raw absolute path is the correct, loader-safe specifier as-is.
describe("importSpecifier › macOS (darwin)", () => {
  const macPaths = [
    "/Users/jane/projects/chasi-app/dist/server.js",
    "/Users/jane/dev/chasi/src/container/controllers/UserController.ts",
    "/Library/WebServer/chasi/dist/server.js",
  ];

  it.each(macPaths)("returns %s unchanged", (p) => {
    expect(importSpecifier(p, "darwin")).toBe(p);
  });

  it("preserves spaces verbatim (no %20, no file:// — the regression)", () => {
    const p = "/Users/jane/my projects/chasi-ts implement/dist/server.js";
    const spec = importSpecifier(p, "darwin");
    expect(spec).toBe(p);
    expect(spec).not.toContain("%20");
    expect(spec).not.toMatch(/^file:\/\//);
  });
});

// ── Linux ───────────────────────────────────────────────────────────────────
describe("importSpecifier › Linux", () => {
  const linuxPaths = [
    "/home/deploy/chasi/dist/server.js",
    "/srv/www/chasi-app/dist/server.js",
    "/opt/apps/chasi/src/container/models/User.ts",
  ];

  it.each(linuxPaths)("returns %s unchanged", (p) => {
    expect(importSpecifier(p, "linux")).toBe(p);
  });

  it("preserves spaces verbatim (no %20, no file://)", () => {
    const p = "/srv/my app/chasi/dist/server.js";
    const spec = importSpecifier(p, "linux");
    expect(spec).toBe(p);
    expect(spec).not.toContain("%20");
    expect(spec).not.toMatch(/^file:\/\//);
  });
});

// ── Windows (win32) ───────────────────────────────────────────────────────────
// A bare `C:\…` path crashes the ESM loader, so the win32 branch must emit a
// `file://` URL instead.
describe("importSpecifier › Windows (win32)", () => {
  it.each([
    "C:\\Users\\Jane\\chasi\\dist\\server.js",
    "C:\\inetpub\\wwwroot\\chasi\\src\\container\\controllers\\UserController.ts",
    "D:\\projects\\chasi-app\\dist\\server.js",
  ])("transforms the drive path %s into a file:// URL (never raw)", (drive) => {
    const spec = importSpecifier(drive, "win32");
    expect(spec).not.toBe(drive); // would otherwise trigger ERR_UNSUPPORTED_ESM_URL_SCHEME
    expect(spec.startsWith("file:")).toBe(true);
  });

  it("produces a well-formed, parseable file:// URL", () => {
    const spec = importSpecifier("/srv/app/dist/server.js", "win32");
    expect(spec).toMatch(/^file:\/\//);
    expect(() => new URL(spec)).not.toThrow();
  });

  it("round-trips back to the original path via fileURLToPath", () => {
    const p = "/srv/app/dist/server.js";
    expect(fileURLToPath(importSpecifier(p, "win32"))).toBe(p);
  });

  it("percent-encodes spaces in the URL and still decodes to the real path", () => {
    const p = "/srv/my app/dist/server.js";
    const spec = importSpecifier(p, "win32");
    expect(spec).toContain("%20");
    expect(fileURLToPath(spec)).toBe(p);
  });
});

// ── cross-OS contract ─────────────────────────────────────────────────────────
describe("importSpecifier › cross-OS contract", () => {
  const sample = "/Users/dev/my app/x.js";

  it("macOS and Linux resolve identically (both POSIX, raw)", () => {
    expect(importSpecifier(sample, "darwin")).toBe(importSpecifier(sample, "linux"));
  });

  it("Windows diverges from POSIX (encoded URL vs raw path)", () => {
    expect(importSpecifier(sample, "win32")).not.toBe(importSpecifier(sample, "linux"));
  });

  it("defaults to the current process.platform when none is passed", () => {
    const p = "/srv/app/x.js";
    expect(importSpecifier(p)).toBe(importSpecifier(p, process.platform));
  });
});
