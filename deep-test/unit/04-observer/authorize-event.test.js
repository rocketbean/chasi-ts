/**
 * Phase 4 — container/events/Authorize.ts + Observer.setup() end-to-end.
 *
 * setup() dynamically imports each configured event class and registers it, so
 * this also exercises register()/watch() against the real Authorize event.
 */
import { describe, it, expect, vi, beforeAll } from "vitest";
import "../../harness/globals.ts";
import Observer from "../../../src/package/Observer/index.js";
import Event from "../../../src/package/Observer/Event.js";
import Authorize from "../../../src/container/events/Authorize.js";
describe("Authorize event", () => {
    it("is an Event subclass with pass-through validate and a no-op fire", async () => {
        const ev = new Authorize();
        expect(ev).toBeInstanceOf(Event);
        const next = vi.fn();
        await ev.validate({}, next);
        expect(next).toHaveBeenCalledOnce();
        await expect(ev.fire({ userId: "1" })).resolves.toBeUndefined();
    });
});
describe("Observer.setup() with the real observer config", () => {
    let obs;
    beforeAll(async () => {
        obs = new Observer({
            events: { authorized: "container/events/Authorize" },
            beforeEmit: async () => { },
            afterEmit: async () => { },
        });
        await obs.setup();
    });
    it("registers the configured 'authorized' event as an Authorize instance", () => {
        expect(obs.$events.authorized).toBeInstanceOf(Authorize);
    });
    it("dispatches to the registered event and its when() listeners", async () => {
        const cb = vi.fn();
        obs.when("authorized", cb, { params: { role: "admin" } });
        await obs.emit("authorized", { userId: "42" });
        expect(cb).toHaveBeenCalledWith({ role: "admin" }, { userId: "42" });
    });
});
