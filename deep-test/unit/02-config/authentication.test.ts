/**
 * Phase 2 — config/authentication.ts.
 * .env.test presets oauthkey=chasi-deep-test.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import "../../harness/globals.ts";

const snapshot = process.env.oauthkey;
afterEach(() => {
  if (snapshot === undefined) delete process.env.oauthkey;
  else process.env.oauthkey = snapshot;
  vi.resetModules();
});

async function load(): Promise<any> {
  vi.resetModules();
  return (await import("../../../src/config/authentication.js")).default;
}

describe("config/authentication › dev driver", () => {
  it("uses the built-in jwt handler (handler: null)", async () => {
    const dev = (await load()).drivers.dev;
    expect(dev.driver).toBe("jwt");
    expect(dev.handler).toBeNull();
  });

  it("resolves model and empty AuthRouteExceptions", async () => {
    const dev = (await load()).drivers.dev;
    expect(dev.model).toBe("user");
    expect(dev.AuthRouteExceptions).toEqual([]);
  });

  it("key falls back to 'chasi-dev' when oauthkey is unset", async () => {
    delete process.env.oauthkey;
    expect((await load()).drivers.dev.key).toBe("chasi-dev");
  });

  it("key reads the oauthkey env var when set", async () => {
    process.env.oauthkey = "rotated-secret";
    expect((await load()).drivers.dev.key).toBe("rotated-secret");
  });
});
