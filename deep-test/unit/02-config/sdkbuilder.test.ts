/**
 * Phase 2 — config/sdkbuilder.ts.
 * .env.test presets ServerPort=3099; the SDKBUILDER and SDK_HOST vars are unset (defaults).
 * terser is a real dependency and imported for real here.
 *
 * Shape note: sdkbuilder is multi-output — every field lives on `config.output[N]`.
 * This project ships a single default output at index 0.
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

/** The single default output ([0]). */
async function out0(): Promise<any> {
  vi.resetModules();
  return (await import("../../../src/config/sdkbuilder.js")).default.output[0];
}

describe("config/sdkbuilder › enabled", () => {
  it("defaults to true", async () => {
    set("SDKBUILDER_ENABLED", undefined);
    expect((await out0()).enabled).toBe(true);
  });

  it("is false only for the literal 'false'", async () => {
    set("SDKBUILDER_ENABLED", "false");
    expect((await out0()).enabled).toBe(false);
  });
});

describe("config/sdkbuilder › host", () => {
  it("defaults to localhost on ServerPort", async () => {
    set("SDK_HOST", undefined);
    set("ServerPort", "3099");
    expect((await out0()).host).toBe("http://localhost:3099");
  });

  it("honors SDK_HOST when set", async () => {
    set("SDK_HOST", "https://api.example.com");
    expect((await out0()).host).toBe("https://api.example.com");
  });
});

describe("config/sdkbuilder › output & client", () => {
  it("defaults the output filename and attaches a formatter function", async () => {
    set("SDKBUILDER_OUTPUT", undefined);
    const o = await out0();
    expect(o.filename).toBe("sdk/chasi.sdk.js");
    expect(typeof o.formatter).toBe("function");
  });

  it("honors SDKBUILDER_OUTPUT", async () => {
    set("SDKBUILDER_OUTPUT", "sdk/custom.sdk.js");
    expect((await out0()).filename).toBe("sdk/custom.sdk.js");
  });

  it("defaults httpClient to fetch and selects the api router", async () => {
    const o = await out0();
    expect(o.httpClient).toBe("fetch");
    expect(o.routers).toEqual(["api"]);
    expect(o.exclude).toEqual([{ m: "post", url: "/api/users/forget" }]);
  });
});
