/**
 * Phase 8 — ApiSpec/SdkBuilder beforeServerBoot gating + thin providers' boot.
 * The ApiSpec and SdkBuilder modules are mocked (their internals are Phase 9).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../src/container/modules/ApiSpecs/spec.js", () => ({
  default: { init: vi.fn(async () => {}), instance: { compile: vi.fn(async () => {}) } },
}));
vi.mock("../../../src/container/modules/SdkBuilder/SdkBuilder.js", () => ({
  default: {
    init: vi.fn(async () => {}),
    instance: { compile: vi.fn(async () => {}), clearSdkHandlers: vi.fn() },
  },
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
});

describe("thin providers", () => {
  it("RepoServiceProvider.boot resolves to undefined", async () => {
    expect(await new RepoServiceProvider().boot()).toBeUndefined();
  });
  it("StreamEngineServiceProvider.boot resolves to undefined", async () => {
    expect(await new StreamEngineServiceProvider().boot()).toBeUndefined();
  });
});

describe("ApiSpecServiceProvider.beforeServerBoot", () => {
  it("is a no-op when apispec is disabled", async () => {
    (Provider as any).config = { apispec: { enabled: false } };
    await new ApiSpecServiceProvider().beforeServerBoot();
    expect((ApiSpec as any).init).not.toHaveBeenCalled();
  });

  it("initializes and compiles the spec when enabled", async () => {
    const cfg = { enabled: true, output: { filename: "api.spec.json" } };
    (Provider as any).config = { apispec: cfg };
    await new ApiSpecServiceProvider().beforeServerBoot();
    expect((ApiSpec as any).init).toHaveBeenCalledWith(cfg);
    expect((ApiSpec as any).instance.compile).toHaveBeenCalledOnce();
  });
});

describe("SdkBuilderServiceProvider.beforeServerBoot", () => {
  it("is a no-op when sdkbuilder is disabled", async () => {
    (Provider as any).config = { sdkbuilder: { enabled: false } };
    await new SdkBuilderServiceProvider().beforeServerBoot();
    expect((SdkBuilder as any).init).not.toHaveBeenCalled();
  });

  it("builds and clears handlers when enabled", async () => {
    const cfg = { enabled: true };
    (Provider as any).config = { sdkbuilder: cfg };
    await new SdkBuilderServiceProvider().beforeServerBoot();
    expect((SdkBuilder as any).init).toHaveBeenCalledWith(cfg);
    expect((SdkBuilder as any).instance.compile).toHaveBeenCalledOnce();
    expect((SdkBuilder as any).instance.clearSdkHandlers).toHaveBeenCalledOnce();
  });
});
