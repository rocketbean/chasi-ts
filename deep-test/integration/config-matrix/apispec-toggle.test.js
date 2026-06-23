/**
 * Phase 11 — config matrix: apispec enabled → spec file produced.
 * Opt-in: DEEP_INTEGRATION=1.
 */
import { describe, it, expect, afterAll } from "vitest";
import fs from "fs";
import { boot, shutdown } from "../../harness/app.ts";
const RUN = !!process.env.DEEP_INTEGRATION;
describe.skipIf(!RUN)("config matrix › apispec toggle", () => {
    afterAll(async () => {
        await shutdown();
    });
    it("produces the configured spec file when apispec is enabled (default)", async () => {
        await boot();
        const config = (await import("../../../src/config/apispec.js")).default;
        if (config.enabled) {
            expect(fs.existsSync(config.output.filename)).toBe(true);
        }
    });
});
