/**
 * Phase 11 — config matrix: authentication driver wiring. Opt-in: DEEP_INTEGRATION=1.
 * The api router declares auth:"dev", so the dev jwt driver must be live after boot.
 */
import { describe, it, expect, afterAll } from "vitest";
import { boot, shutdown } from "../../harness/app.ts";

const RUN = !!process.env.DEEP_INTEGRATION;

describe.skipIf(!RUN)("config matrix › auth toggle", () => {
  afterAll(async () => {
    await shutdown();
  });

  it("registers the dev jwt auth driver during boot", async () => {
    await boot();
    const Authentication = (await import("../../../src/package/framework/Server/Authentication.js")).default;
    expect(Authentication.$drivers.dev).toBeDefined();
  });
});
