/**
 * Phase 2 — config/sdkbuilder.ts.
 * .env.test presets ServerPort=3099; the SDKBUILDER and SDK_HOST vars are unset (defaults).
 * terser is a real dependency and imported for real here.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import "../../harness/globals.ts";

const KEYS = ["SDKBUILDER_ENABLED", "SDK_HOST", "SDKBUILDER_OUTPUT", "ServerPort"];
const snapshot: Record<string, string | undefined> = {};
for (const k of KEYS) snapshot[k] = process.env[k];

afterEach(() => {
  for (const k of KEYS) {
    if (snapshot[k] === undefined) delete process.env[k];
    else process.env[k] = snapshot[k];
  }
  vi.resetModules();
});

function set(k: string, v?: string) {
  if (v === undefined) delete process.env[k];
  else process.env[k] = v;
}

async function load(): Promise<any> {
  vi.resetModules();
  return (await import("../../../src/config/sdkbuilder.js")).default;
}

describe("config/sdkbuilder › enabled", () => {
  it("defaults to true", async () => {
    set("SDKBUILDER_ENABLED", undefined);
    expect((await load()).enabled).toBe(true);
  });

  it("is false only for the literal 'false'", async () => {
    set("SDKBUILDER_ENABLED", "false");
    expect((await load()).enabled).toBe(false);
  });
});

describe("config/sdkbuilder › host", () => {
  it("defaults to localhost on ServerPort", async () => {
    set("SDK_HOST", undefined);
    set("ServerPort", "3099");
    expect((await load()).host).toBe("http://localhost:3099");
  });

  it("honors SDK_HOST when set", async () => {
    set("SDK_HOST", "https://api.example.com");
    expect((await load()).host).toBe("https://api.example.com");
  });
});

describe("config/sdkbuilder › output & client", () => {
  it("defaults the output filename and attaches a formatter function", async () => {
    set("SDKBUILDER_OUTPUT", undefined);
    const cfg = await load();
    expect(cfg.output.filename).toBe("sdk/chasi.sdk.js");
    expect(typeof cfg.output.formatter).toBe("function");
  });

  it("honors SDKBUILDER_OUTPUT", async () => {
    set("SDKBUILDER_OUTPUT", "sdk/custom.sdk.js");
    expect((await load()).output.filename).toBe("sdk/custom.sdk.js");
  });

  it("defaults httpClient to fetch and selects the api router", async () => {
    const cfg = await load();
    expect(cfg.httpClient).toBe("fetch");
    expect(cfg.routers).toEqual(["api"]);
    expect(cfg.exclude).toEqual([{ m: "post", url: "/api/users/forget" }]);
  });
});
