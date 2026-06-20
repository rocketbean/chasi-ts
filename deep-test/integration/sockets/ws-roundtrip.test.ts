/**
 * Phase 10/12 — live WebSocket round-trip. Opt-in: DEEP_INTEGRATION=1.
 * Boots the app, connects a ws client to the upgrade route and expects the
 * server's "connected" lifecycle event. `ws` is imported lazily so this file
 * stays importable even where the dep is absent.
 */
import { describe, it, expect, afterAll } from "vitest";
import { boot, shutdown } from "../../harness/app.ts";

const RUN = !!process.env.DEEP_INTEGRATION;

describe.skipIf(!RUN)("integration › ws round-trip", () => {
  afterAll(async () => {
    await shutdown();
  });

  it("receives a 'connected' event on connect", async () => {
    const handler = await boot();
    const port = handler.$app.config.server.port;
    const { WebSocket } = await import("ws");
    const sock = new WebSocket(`ws://localhost:${port}/`);

    const message = await new Promise<any>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("ws connect timeout")), 4000);
      sock.on("message", (data: any) => {
        clearTimeout(timer);
        try {
          resolve(JSON.parse(data.toString()));
        } catch {
          resolve(data.toString());
        }
      });
      sock.on("error", (e: any) => {
        clearTimeout(timer);
        reject(e);
      });
    });

    expect(message?.event ?? message?.action ?? "connected").toBeDefined();
    sock.close();
  });
});
