/**
 * Phase 4 — Observer async pipeline ordering & error isolation.
 *
 * watch() registers an async emitter listener that runs, inside validate's next():
 *   onemit → fire → fireListeners → emitted
 * and wraps the whole thing in try/catch so a throwing stage is swallowed.
 */
import { describe, it, expect } from "vitest";
import "../../harness/globals.ts";
import Observer from "../../../src/package/Observer/index.js";
import Event from "../../../src/package/Observer/Event.js";
function makeObserver() {
    return new Observer({ events: {}, beforeEmit: async () => { }, afterEmit: async () => { } });
}
class SpyEvent extends Event {
    order = [];
    validate = async (_p, next) => {
        this.order.push("validate");
        await next();
    };
    onemit = async () => {
        this.order.push("onemit");
    };
    fire = async () => {
        this.order.push("fire");
    };
    fireListeners = async () => {
        this.order.push("fireListeners");
    };
    emitted = async () => {
        this.order.push("emitted");
    };
}
describe("Observer › async ordering", () => {
    it("runs validate → onemit → fire → fireListeners → emitted in order", async () => {
        const obs = makeObserver();
        const inst = new SpyEvent();
        await obs.register("ord", inst);
        await obs.emit("ord", {});
        expect(inst.order).toEqual(["validate", "onemit", "fire", "fireListeners", "emitted"]);
    });
    it("awaits async listeners before emit resolves", async () => {
        const obs = makeObserver();
        class LE extends Event {
            validate = async (_p, next) => next();
            fire = async () => { };
        }
        await obs.register("slow", new LE());
        let done = false;
        obs.when("slow", async () => {
            await new Promise((r) => setTimeout(r, 10));
            done = true;
        });
        await obs.emit("slow", {});
        expect(done).toBe(true);
    });
});
describe("Observer › error isolation", () => {
    it("swallows a throwing stage and skips emitted, without rejecting emit", async () => {
        const obs = makeObserver();
        class ThrowEvent extends SpyEvent {
            fire = async () => {
                this.order.push("fire");
                throw new Error("boom in fire");
            };
        }
        const inst = new ThrowEvent();
        await obs.register("bad", inst);
        await expect(obs.emit("bad", {})).resolves.toBeUndefined();
        expect(inst.order).toContain("fire");
        expect(inst.order).not.toContain("emitted");
    });
});
