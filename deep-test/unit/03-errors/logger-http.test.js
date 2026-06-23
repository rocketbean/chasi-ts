/**
 * Phase 3 — Http exception logger (discovery).
 *
 * loggers/Http.ts is an empty file in 4.1.2 (no export) and is NOT registered in
 * ExceptionLogger.writers (only database/terminal/textfile are). Recorded per the
 * deep-test convention rather than asserting a behavior that doesn't exist.
 */
import { describe, it, expect } from "vitest";
import "../../harness/globals.ts";
import ExceptionLogger from "../../../src/package/framework/ErrorHandler/ExceptionLogger.js";
describe("Http exception logger", () => {
    it("is not a registered ExceptionLogger channel in 4.1.2", () => {
        expect(Object.keys(ExceptionLogger.writers).sort()).toEqual([
            "database",
            "terminal",
            "textfile",
        ]);
        expect(ExceptionLogger.writers.http).toBeUndefined();
    });
    it.todo("loggers/Http.ts is an empty stub — no HTTP exception channel implemented yet");
});
