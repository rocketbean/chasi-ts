/**
 * Phase 1 — Handler (src/package/Handler.ts): singleton + lifecycle surface.
 *
 * Full Handler.init() boots services/observer/app and is exercised in the
 * integration tier (Phase 12). Here we cover the unit-safe surface: the
 * singleton accessor, the lifecycle method shape, the state getter/setter, and
 * the close() path (with a mocked $app) — including double-close and error
 * tolerance.
 */
import { describe, it, expect, vi, beforeAll } from "vitest";
import "../../harness/globals.ts";
import ready from "../../../src/package/helper.js";
import { Handler } from "../../../src/package/Handler.js";
describe("Handler › singleton & shape", () => {
    beforeAll(async () => {
        await ready;
    });
    it("exposes no Instance before init()", () => {
        // Per-file module isolation: nothing in this file has called init().
        expect(Handler.Instance).toBeUndefined();
    });
    it("exposes the documented lifecycle methods on the prototype", () => {
        const p = Handler.prototype;
        for (const m of ["start", "before", "initialize", "after", "boot", "close", "setup"]) {
            expect(typeof p[m]).toBe("function");
        }
    });
});
describe("Handler › state getter/setter", () => {
    it("reads and writes the numeric _state", () => {
        const fake = Object.create(Handler.prototype);
        fake._state = 0;
        expect(fake.state).toBe(0);
        fake.state = 3;
        expect(fake.state).toBe(3);
        expect(fake._state).toBe(3);
    });
});
describe("Handler › close()", () => {
    it("closes the underlying http server and resolves true", async () => {
        const close = vi.fn();
        const fake = Object.create(Handler.prototype);
        fake.$app = { $httpServer: { close } };
        await expect(Handler.prototype.close.call(fake)).resolves.toBe(true);
        expect(close).toHaveBeenCalledOnce();
    });
    it("is safe to call twice (double-close)", async () => {
        const close = vi.fn();
        const fake = Object.create(Handler.prototype);
        fake.$app = { $httpServer: { close } };
        await Handler.prototype.close.call(fake);
        await expect(Handler.prototype.close.call(fake)).resolves.toBe(true);
        expect(close).toHaveBeenCalledTimes(2);
    });
    it("swallows errors from the server close and resolves undefined", async () => {
        const fake = Object.create(Handler.prototype);
        fake.$app = {
            $httpServer: {
                close: () => {
                    throw new Error("already closed");
                },
            },
        };
        await expect(Handler.prototype.close.call(fake)).resolves.toBeUndefined();
    });
});
describe("Handler › documented state machine (discovery)", () => {
    // The class comments describe a status transition
    //   off -> initializing -> instantiating -> initialized
    // but in 4.1.2 the private `status` field is never reassigned anywhere in
    // Handler.ts (only the numeric `_state` is, via its setter). Recording this as
    // a discovery per deep-test convention instead of bending the test around it.
    it.todo("status transitions off->initializing->instantiating->initialized are not wired in 4.1.2");
});
