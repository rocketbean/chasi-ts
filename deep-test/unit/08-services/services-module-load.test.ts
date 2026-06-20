/**
 * Phase 8 — ServicesModule load + Service boot.
 */
import { describe, it, expect } from "vitest";
import "../../harness/globals.ts";
import ServicesModule from "../../../src/package/framework/Services/ServicesModule.js";
import Service from "../../../src/package/framework/Services/Service.js";

describe("Service", () => {
  it("instantiates the provider and stores the boot() result", async () => {
    class FakeProvider {
      async boot() {
        return "BOOTED";
      }
    }
    const s = new Service("svc", FakeProvider);
    expect(s.instance).toBeInstanceOf(FakeProvider);
    await s.boot();
    expect(s.service).toBe("BOOTED");
  });
});

describe("ServicesModule.bootServices", () => {
  it("loads, instantiates and boots a Service per declared provider", async () => {
    const m = new ServicesModule({ a: "path/a", b: "path/b" });
    m.fetchFile = async (p: string) =>
      class {
        async boot() {
          return `svc:${p}`;
        }
      };
    await m.bootServices();
    expect(m.$container.a).toBeInstanceOf(Service);
    expect(m.$container.a.service).toBe("svc:path/a");
    expect(m.$container.b.service).toBe("svc:path/b");
  });
});

describe("ServicesModule.installServices", () => {
  it("maps each booted service by its name", async () => {
    const m = new ServicesModule({});
    m.$container = {
      a: { name: "alpha", service: { x: 1 } },
      b: { name: "beta", service: { y: 2 } },
    } as any;
    expect(await m.installServices()).toEqual({ alpha: { x: 1 }, beta: { y: 2 } });
  });
});
