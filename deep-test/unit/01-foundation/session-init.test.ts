/**
 * Phase 1 — Session (src/package/framework/Chasi/Session.ts).
 *
 * The full Session.initialize() wires ServiceCluster/storage/PipeHandler and is
 * an integration concern (Phase 12). This file covers the unit-safe statics and
 * the constructor surface: thread detection, node version parsing, config
 * registry access, the validates() guard, and the beforeSessionHook ordering.
 */
import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import Cluster from "cluster";
import "../../harness/globals.ts";
import ready from "../../../src/package/helper.js";
import Session from "../../../src/package/framework/Chasi/Session.js";
import Writer from "../../../src/package/Logger/types/Writer.js";

describe("Session › constructor", () => {
  beforeAll(async () => {
    await ready;
  });

  it("stores config and assigns a unique uuid id per instance", () => {
    const a = new Session({ server: {} } as any);
    const b = new Session({ server: {} } as any);
    expect(a.config).toEqual({ server: {} });
    expect(a.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(a.id).not.toBe(b.id);
  });

  it("attachApp() does not throw", () => {
    const s = new Session({} as any);
    expect(() => s.attachApp({} as any)).not.toThrow();
  });
});

describe("Session › statics", () => {
  it("nodeVer parses the running node major.minor", () => {
    const expected = Number(process.version.match(/^v(\d+\.\d+)/)![1]);
    expect(Session.nodeVer).toBe(expected);
    expect(Session.nodeVer).toBeGreaterThan(0);
  });

  it("checkMainThread() reflects cluster primary status on node >= 16", () => {
    expect(Session.checkMainThread()).toBe(Cluster.isPrimary);
  });

  it("getConfig() reads sections from the static _conf registry", () => {
    Session._conf = { server: { port: 4321 }, database: { default: "mongo" } };
    expect(Session.getConfig("server")).toEqual({ port: 4321 });
    expect(Session.getConfig("database")).toEqual({ default: "mongo" });
  });
});

describe("Session › validates()", () => {
  const original = Writer.log;
  afterEach(() => {
    Writer.log = original;
  });

  it("is a no-op when the compiler is disabled", async () => {
    Writer.log = original;
    await expect(Session.validates({ compiler: { enabled: false } })).resolves.toBeUndefined();
    expect(Writer.log).toBe(original); // unchanged
  });

  it("installs a Writer.log sink when the compiler is enabled", async () => {
    await Session.validates({ compiler: { enabled: true } });
    expect(typeof Writer.log).toBe("function");
    expect(Writer.log).not.toBe(original);
    // the installed sink must not throw on a plain string (silence its stdout write)
    const spy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    expect(() => (Writer.log as Function)("hello")).not.toThrow();
    spy.mockRestore();
  });
});

describe("Session › beforeSessionHook()", () => {
  it("on the main thread, seeds _conf and runs server.hooks.beforeApp(getConfig)", async () => {
    const beforeApp = vi.fn();
    const config: any = { server: { hooks: { beforeApp } }, marker: true };
    await Session.beforeSessionHook(config);

    expect(beforeApp).toHaveBeenCalledOnce();
    expect(beforeApp).toHaveBeenCalledWith(Session.getConfig);
    // _conf is a shallow spread of the passed config
    expect(Session._conf.marker).toBe(true);
    expect(Session._conf.server).toBe(config.server);
  });
});
