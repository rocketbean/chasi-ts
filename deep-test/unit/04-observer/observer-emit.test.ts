/**
 * Phase 4 — Observer registration & emit wiring (Observer/index.ts).
 */
import { describe, it, expect, vi } from "vitest";
import "../../harness/globals.ts";
import Observer from "../../../src/package/Observer/index.js";
import Event from "../../../src/package/Observer/Event.js";

function makeObserver() {
  return new Observer({ events: {}, beforeEmit: async () => {}, afterEmit: async () => {} } as any);
}

// Event that uses the base fireListeners so when()-registered listeners actually run.
class ListenerEvent extends Event {
  validate = async (_p: any, next: () => Promise<void>) => {
    await next();
  };
  fire = async () => {};
}

describe("Observer › register", () => {
  it("injects beforeEmit/afterEmit props when the event lacks them", async () => {
    const obs = makeObserver();
    const inst = new ListenerEvent();
    await obs.register("e", inst as any);
    expect(typeof (inst as any).props.beforeEmit).toBe("function");
    expect(typeof (inst as any).props.afterEmit).toBe("function");
    expect(obs.$events.e).toBe(inst);
  });
});

describe("Observer › emit pipeline", () => {
  it("runs validate then fire with the emitted payload", async () => {
    const obs = makeObserver();
    const fire = vi.fn();
    const validate = vi.fn(async (_p: any, next: () => Promise<void>) => next());
    const inst: any = Object.assign(new ListenerEvent(), { fire, validate });
    await obs.register("greet", inst);
    await obs.emit("greet", { hello: "world" });
    expect(validate).toHaveBeenCalled();
    expect(fire).toHaveBeenCalledWith({ hello: "world" });
    expect(inst.options).toEqual({ hello: "world" });
  });

  it("emitting an unregistered event is a no-op", async () => {
    const obs = makeObserver();
    await expect(obs.emit("does-not-exist", {})).resolves.toBeUndefined();
  });
});

describe("Observer › when (listeners)", () => {
  it("fires registered listeners with (listener params, emit options)", async () => {
    const obs = makeObserver();
    await obs.register("ev", new ListenerEvent() as any);
    const cb = vi.fn();
    obs.when("ev", cb, { params: { tag: "x" } });
    await obs.emit("ev", { ctx: 9 });
    expect(cb).toHaveBeenCalledWith({ tag: "x" }, { ctx: 9 });
  });

  it("supports multiple listeners on the same event", async () => {
    const obs = makeObserver();
    await obs.register("ev", new ListenerEvent() as any);
    const a = vi.fn();
    const b = vi.fn();
    obs.when("ev", a);
    obs.when("ev", b);
    await obs.emit("ev", {});
    expect(a).toHaveBeenCalledOnce();
    expect(b).toHaveBeenCalledOnce();
  });
});
