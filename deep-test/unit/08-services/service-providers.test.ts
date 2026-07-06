/**
 * Phase 8 — ApiSpec/SdkBuilder provider hooks + thin providers' boot.
 * The ApiSpec and SdkBuilder modules are mocked (their internals are Phase 9).
 *
 * ApiSpec generation now runs in build() (build mode). SdkBuilder runs in
 * beforeServerBoot() at runtime via the static SdkBuilder.build(config), gated on
 * config.sdkbuilder.output[] and skipped in build mode (__chasiBuild).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../src/container/modules/ApiSpecs/spec.js", () => ({
  default: { init: vi.fn(async () => {}), instance: { compile: vi.fn(async () => {}) } },
}));
vi.mock("../../../src/container/modules/SdkBuilder/SdkBuilder.js", () => ({
  default: { build: vi.fn(async () => {}) },
}));

import "../../harness/globals.ts";
import ApiSpec from "../../../src/container/modules/ApiSpecs/spec.js";
import SdkBuilder from "../../../src/container/modules/SdkBuilder/SdkBuilder.js";
import ApiSpecServiceProvider from "../../../src/container/services/ApiSpecServiceProvider.js";
import SdkBuilderServiceProvider from "../../../src/container/services/SdkBuilderServiceProvider.js";
import RepoServiceProvider from "../../../src/container/services/RepoServiceProvider.js";
import StreamEngineServiceProvider from "../../../src/container/services/StreamEngineServiceProvider.js";
import Provider from "../../../src/package/framework/Services/Provider.js";

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.lead;
  (globalThis as any).__chasiBuild = false;
});

describe("thin providers", () => {
  it("RepoServiceProvider.boot resolves to undefined", async () => {
    expect(await new RepoServiceProvider().boot()).toBeUndefined();
  });
  it("StreamEngineServiceProvider.boot resolves to undefined", async () => {
    expect(await new StreamEngineServiceProvider().boot()).toBeUndefined();
  });
});

describe("ApiSpecServiceProvider.build", () => {
  it("is a no-op when apispec is disabled", async () => {
    (Provider as any).config = { apispec: { enabled: false } };
    await new ApiSpecServiceProvider().build();
    expect((ApiSpec as any).init).not.toHaveBeenCalled();
  });

  it("initializes and compiles the spec when enabled", async () => {
    const cfg = { enabled: true, output: { filename: "api.spec.json" } };
    (Provider as any).config = { apispec: cfg };
    await new ApiSpecServiceProvider().build();
    expect((ApiSpec as any).init).toHaveBeenCalledWith(cfg);
    expect((ApiSpec as any).instance.compile).toHaveBeenCalledOnce();
  });
});

describe("SdkBuilderServiceProvider.beforeServerBoot", () => {
  it("is a no-op when no outputs are configured", async () => {
    (Provider as any).config = { sdkbuilder: { output: [] }, server: {} };
    await new SdkBuilderServiceProvider().beforeServerBoot();
    expect((SdkBuilder as any).build).not.toHaveBeenCalled();
  });

  it("builds the configured outputs (single process)", async () => {
    const cfg = { output: [{ namespace: "api", enabled: true }] };
    (Provider as any).config = { sdkbuilder: cfg, server: {} };
    await new SdkBuilderServiceProvider().beforeServerBoot();
    expect((SdkBuilder as any).build).toHaveBeenCalledWith(cfg);
  });

  it("skips generation in build mode (build() handles it)", async () => {
    (globalThis as any).__chasiBuild = true;
    (Provider as any).config = { sdkbuilder: { output: [{ namespace: "api" }] }, server: {} };
    await new SdkBuilderServiceProvider().beforeServerBoot();
    expect((SdkBuilder as any).build).not.toHaveBeenCalled();
  });
});
