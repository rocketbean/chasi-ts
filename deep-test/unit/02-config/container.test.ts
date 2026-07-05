/**
 * Phase 2 — config/container.ts.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import "../../harness/globals.ts";

const snapshot = process.env.APPNAME;
afterEach(() => {
  if (snapshot === undefined) delete process.env.APPNAME;
  else process.env.APPNAME = snapshot;
  vi.resetModules();
});

async function load(): Promise<any> {
  vi.resetModules();
  return (await import("../../../src/config/container.js")).default;
}

describe("config/container › name", () => {
  it("defaults to 'Chasi' when APPNAME is unset", async () => {
    delete process.env.APPNAME;
    expect((await load()).name).toBe("Chasi");
  });

  it("reads APPNAME when set", async () => {
    process.env.APPNAME = "Billing";
    expect((await load()).name).toBe("Billing");
  });
});

describe("config/container › ServiceBootstrap", () => {
  it("maps every built-in provider to its path", async () => {
    const sb = (await load()).ServiceBootstrap;
    expect(sb).toEqual({
      compiler: "container/services/CompilerEngineServiceProvider",
      routers: "container/services/RouterServiceProvider",
      sockets: "container/services/SocketServiceProvider",
      apispec: "container/services/ApiSpecServiceProvider",
      sdkbuilder: "container/services/SdkBuilderServiceProvider",
    });
  });
});

describe("config/container › middlewares & misc", () => {
  it("registers the auth and testmode middleware aliases", async () => {
    const cfg = await load();
    expect(cfg.middlewares.auth).toBe("./container/middlewares/Auth");
    expect(cfg.middlewares.testmode).toBe("./container/middlewares/TestMode.mw");
  });

  it("exposes ControllerDir and session defaults", async () => {
    const cfg = await load();
    expect(cfg.ControllerDir).toBe("container/controllers");
    expect(cfg.session).toMatchObject({ cache: false, useLogStream: true });
  });
});
