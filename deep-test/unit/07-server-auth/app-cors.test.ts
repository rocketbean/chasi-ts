/**
 * Phase 7 — App applies the configured CORS middleware during install().
 */
import { describe, it, expect, vi } from "vitest";
import "../../harness/globals.ts";
import App from "../../../src/package/framework/Server/App.js";

function makeApp() {
  const config = {
    port: 3099,
    environment: "local",
    modes: { local: { protocol: "http", key: null, cert: null } },
    cors: { origin: "*", credentials: false },
  };
  return new App(config as any, { full: { write() {} }, EndTraceFull: { write() {} } } as any);
}

describe("App › cors", () => {
  it("registers a middleware on the express app during install", async () => {
    const app = makeApp();
    const useSpy = vi.spyOn(app.$server, "use");
    await app.install();
    expect(useSpy).toHaveBeenCalled();
  });
});
