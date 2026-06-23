/**
 * Phase 7 — container/middlewares/TestMode.mw.ts.
 * Active only when process.env.testMode === "enabled" (the danger-route guard).
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import "../../harness/globals.ts";
import testModeMw from "../../../src/container/middlewares/TestMode.mw.js";
const prev = process.env.testMode;
afterEach(() => {
    if (prev === undefined)
        delete process.env.testMode;
    else
        process.env.testMode = prev;
});
function makeRes() {
    const res = { status: vi.fn(() => res), send: vi.fn(() => res) };
    return res;
}
describe("TestMode middleware", () => {
    it("passes through when test mode is enabled", async () => {
        process.env.testMode = "enabled";
        const res = makeRes();
        const next = vi.fn();
        await testModeMw({}, res, next);
        expect(next).toHaveBeenCalledOnce();
        expect(res.status).not.toHaveBeenCalled();
    });
    it("returns 404 when test mode is off", async () => {
        process.env.testMode = "off";
        const res = makeRes();
        const next = vi.fn();
        await testModeMw({}, res, next);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(next).not.toHaveBeenCalled();
    });
});
