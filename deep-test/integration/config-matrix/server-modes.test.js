/**
 * Phase 11 — config matrix: server mode → server type. Opt-in: DEEP_INTEGRATION=1.
 * Boots with the active .env.test config (environment=local) and asserts the
 * observable server protocol. Full http-vs-https matrix needs a per-variant boot.
 */
import { describe, it, expect, afterAll } from "vitest";
import { boot, shutdown } from "../../harness/app.ts";
const RUN = !!process.env.DEEP_INTEGRATION;
describe.skipIf(!RUN)("config matrix › server modes", () => {
    afterAll(async () => {
        await shutdown();
    });
    it("local mode builds a plain http server", async () => {
        const handler = await boot();
        expect(handler.$app.mode.protocol).toBe("http");
    });
});
