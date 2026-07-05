/**
 * Phase 4 — Observer/Event.ts (base Event).
 */
import { describe, it, expect, vi } from "vitest";
import "../../harness/globals.ts";
import Event from "../../../src/package/Observer/Event.js";
import Listener from "../../../src/package/Observer/Listener.js";
describe("Event base", () => {
    it("initializes empty props/listeners and a logger", () => {
        const ev = new Event();
        expect(ev.props).toEqual({});
        expect(ev.listeners).toEqual([]);
        expect(ev.logger).toBeDefined();
    });
    it("fireListeners invokes each listener with (listener params, event options)", async () => {
        const ev = new Event();
        ev.options = { ctx: 1 };
        const cb = vi.fn();
        ev.listeners.push(new Listener("e", cb, { params: { p: 2 } }));
        await ev.fireListeners();
        expect(cb).toHaveBeenCalledWith({ p: 2 }, { ctx: 1 });
    });
    it("awaits every listener (multiple listeners all run)", async () => {
        const ev = new Event();
        ev.options = {};
        const a = vi.fn();
        const b = vi.fn();
        ev.listeners.push(new Listener("e", a), new Listener("e", b));
        await ev.fireListeners();
        expect(a).toHaveBeenCalledOnce();
        expect(b).toHaveBeenCalledOnce();
    });
    it("onemit applies the injected beforeEmit hook with the event options", async () => {
        const ev = new Event();
        ev.options = { o: 1 };
        const beforeEmit = vi.fn();
        ev.props = { beforeEmit, afterEmit: vi.fn() };
        await ev.onemit();
        expect(beforeEmit).toHaveBeenCalledWith({ o: 1 });
    });
    it("emitted applies the injected afterEmit hook with the event options", async () => {
        const ev = new Event();
        ev.options = { o: 2 };
        const afterEmit = vi.fn();
        ev.props = { beforeEmit: vi.fn(), afterEmit };
        await ev.emitted();
        expect(afterEmit).toHaveBeenCalledWith({ o: 2 });
    });
});
