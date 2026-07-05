/**
 * Phase 2 — config/observer.ts (no env-driven fields).
 */
import { describe, it, expect } from "vitest";
import "../../harness/globals.ts";
import observer from "../../../src/config/observer.js";
describe("config/observer", () => {
    it("registers the authorized event alias", () => {
        expect(observer.events).toMatchObject({ authorized: "container/events/Authorize" });
    });
    it("exposes async beforeEmit/afterEmit global hooks", () => {
        expect(typeof observer.beforeEmit).toBe("function");
        expect(typeof observer.afterEmit).toBe("function");
    });
    it("the hooks resolve without throwing", async () => {
        await expect(observer.beforeEmit.call({}, { any: "payload" })).resolves.toBeUndefined();
        await expect(observer.afterEmit.call({}, { any: "payload" })).resolves.toBeUndefined();
    });
});
