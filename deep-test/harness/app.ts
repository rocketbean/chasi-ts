/**
 * INTEGRATION-tier app bootstrap.
 *
 * Boots the real chasi-ts framework exactly as production does
 * (src/server.ts -> Base.Ignition() -> Session.initialize() -> Handler),
 * and exposes the live Express app for supertest plus a clean shutdown.
 *
 * Use ONLY in deep-test/integration/** — this performs real DB connections,
 * route registration, and service-provider boot. It requires the env in
 * deep-test/.env.test (and, for live DB/socket suites, running infra).
 *
 *   import { boot, shutdown } from "../../harness/app.ts";
 *   const handler = await boot();
 */
import "./globals.ts";

let handlerPromise: Promise<any> | null = null;

/**
 * Wait until the app has actually finished booting.
 *
 * Handler.init() resolves after `start()`, but the framework's lifecycle event
 * BeforeApp.validate calls next() WITHOUT awaiting it, so the
 * before→initialize→after→boot→bootup chain (which builds $httpServer and binds
 * the port) completes asynchronously AFTER Handler.init resolves. Returning the
 * handler before that finishes hands tests a half-booted app (no $httpServer, no
 * routes registered). Poll until the http server is listening.
 */
async function waitForReady(handler: any, timeoutMs = 20000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (handler?.$app?.$httpServer?.listening) return;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error("deep-test: app did not reach a listening state within the timeout");
}

/** Boot (or return the already-booted) framework Handler singleton. */
export async function boot(): Promise<any> {
  if (!handlerPromise) {
    // .env.test pins a single ServerPort (3099) so the unit config tests can assert
    // it. But each integration test file boots its own app in its own worker — on a
    // single fixed port they collide ("All ports in [3099] are in use"). Hand the
    // boot a PORT RANGE so it auto-falls-back to a free port. Override via
    // DEEP_SERVER_PORTS. A range/list already set by the caller is respected.
    const current = String(process.env.ServerPort ?? "");
    if (!/[-,]/.test(current)) {
      process.env.ServerPort = process.env.DEEP_SERVER_PORTS ?? "4100-4199";
    }
    // Lazy import so the heavy boot only happens when an integration test asks.
    handlerPromise = (async () => {
      const handler = (await import("../../src/server.ts")).default;
      await waitForReady(handler);
      return handler;
    })();
  }
  return handlerPromise;
}

/** Resolve the underlying Express app instance (for supertest). */
export async function expressApp(): Promise<any> {
  const handler = await boot();
  return handler.$app.$server;
}

/** Cleanly close the HTTP server + (where supported) DB connections. */
export async function shutdown(): Promise<void> {
  if (!handlerPromise) return;
  const handler = await handlerPromise;
  try {
    await handler.close();
  } finally {
    handlerPromise = null;
  }
}
