/**
 * Phase 12 — full-boot integration. Opt-in: DEEP_INTEGRATION=1 (live MongoDB).
 */
import { describe, it, expect, afterAll } from "vitest";
import fs from "fs";
import { boot, shutdown } from "../../harness/app.ts";

const RUN = !!process.env.DEEP_INTEGRATION;

describe.skipIf(!RUN)("integration › boot", () => {
  afterAll(async () => {
    await shutdown();
  });

  it("boots the framework to a Handler exposing a live http server", async () => {
    const handler = await boot();
    expect(handler).toBeDefined();
    expect(handler.$app).toBeDefined();
    expect(handler.$app.$httpServer).toBeDefined();
  });

  it("writes api.spec.json to the project root", async () => {
    await boot();
    expect(fs.existsSync("api.spec.json")).toBe(true);
  });

  it("supports a clean shutdown", async () => {
    await boot();
    await expect(shutdown()).resolves.toBeUndefined();
  });
});
