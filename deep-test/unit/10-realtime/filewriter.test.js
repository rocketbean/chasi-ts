/**
 * Phase 10 — SessionWriter formatting + storage/checks discoveries.
 *
 * SessionWriter.format is pure (ignores `this`), so we call it off the prototype
 * to avoid the constructor's checkDir() filesystem side effects.
 */
import { describe, it, expect } from "vitest";
import "../../harness/globals.ts";
import SessionWriter from "../../../src/package/framework/Chasi/writers/FileWriter.js";
import Stomp from "../../../src/package/framework/Chasi/storage/index.js";
import filewrites from "../../../src/package/framework/Chasi/checks/filewrites.js";
describe("SessionWriter.format", () => {
    it("renders non-empty sections and skips empty ones", () => {
        const out = SessionWriter.prototype.format({ logs: ["a", "b"], boot: [] });
        expect(out).toContain("LOGS");
        expect(out).toContain("a");
        expect(out).toContain("b");
        expect(out).not.toContain("BOOT");
    });
});
describe("storage/index Stomp (discovery)", () => {
    // storage/index.ts is an empty `class Stomp {}` stub in 4.1.2 — the real
    // session storage lives in Storage.ts (SessionStorage). Pinned as such.
    it("is an empty placeholder class", () => {
        expect(typeof Stomp).toBe("function");
        expect(Object.getOwnPropertyNames(Stomp.prototype)).toEqual(["constructor"]);
    });
});
describe("checks/filewrites", () => {
    it("resolves without throwing for an existing path", async () => {
        await expect(filewrites("package/helper.ts")).resolves.toBeUndefined();
    });
});
