/**
 * Phase 4 — horizon lifecycle registry + the Exception lifecycle event.
 *
 * The other lifecycle events (BeforeApp/InitializeApp/AfterApp/BootApp/ReadyApp)
 * wire Database/RouterModule/App and only run during a real boot — their ordering
 * is covered in the integration tier (Phase 12). The Exception event is pure
 * enough to unit-test directly.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import "../../harness/globals.ts";
import horizon from "../../../src/package/statics/horizon/config.js";
import ExceptionEvent from "../../../src/package/statics/horizon/events/Exception.js";
import Event from "../../../src/package/Observer/Event.js";

describe("horizon › registry", () => {
  it("maps every lifecycle alias to its event class path", () => {
    expect(horizon.observer.events).toEqual({
      __before__: "package/statics/horizon/events/BeforeApp",
      __after__: "package/statics/horizon/events/AfterApp",
      __initialize__: "package/statics/horizon/events/InitializeApp",
      __exception__: "package/statics/horizon/events/Exception",
      __boot__: "package/statics/horizon/events/BootApp",
      __ready__: "package/statics/horizon/events/ReadyApp",
    });
  });

  it("declares the jwt driver path and cluster storage files", () => {
    expect(horizon.authentication.defaultJWTDriverPAth).toMatch(/AuthDrivers\/jwt\.js$/);
    expect(horizon.server.serviceCluster.serverFile).toMatch(/session\.chasi$/);
    expect(horizon.server.serviceCluster.clusterFile).toMatch(/cluster\.chasi$/);
  });

  it("routes the __exception__ alias through the exceptions channel", () => {
    expect(horizon.exceptions.events).toEqual(["__exception__"]);
  });
});

describe("horizon › Exception event", () => {
  const prevApp = (globalThis as any).$app;
  afterEach(() => {
    (globalThis as any).$app = prevApp;
  });

  it("is an Event subclass whose validate proceeds immediately", async () => {
    const ev = new ExceptionEvent();
    expect(ev).toBeInstanceOf(Event);
    const next = vi.fn();
    await ev.validate({}, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it("logs immediately for interpose === 1", async () => {
    const ev = new ExceptionEvent();
    const exc = { interpose: 1, property: {}, log: vi.fn() };
    await ev.fire({ exception: exc });
    expect(exc.log).toHaveBeenCalledOnce();
  });

  it("logs a non-hidden exception once the app is ready (state >= 4)", async () => {
    (globalThis as any).$app = { state: 4 };
    const ev = new ExceptionEvent();
    const exc = { interpose: 2, property: { hide: false }, log: vi.fn() };
    await ev.fire({ exception: exc });
    expect(exc.log).toHaveBeenCalledOnce();
  });

  it("suppresses a hidden exception", async () => {
    (globalThis as any).$app = { state: 4 };
    const ev = new ExceptionEvent();
    const exc = { interpose: 2, property: { hide: true }, log: vi.fn() };
    await ev.fire({ exception: exc });
    expect(exc.log).not.toHaveBeenCalled();
  });

  it.todo("full BeforeApp→ReadyApp lifecycle ordering is covered in the integration tier");
});
