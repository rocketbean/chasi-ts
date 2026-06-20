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

/** Boot (or return the already-booted) framework Handler singleton. */
export async function boot(): Promise<any> {
  if (!handlerPromise) {
    // Lazy import so the heavy boot only happens when an integration test asks.
    handlerPromise = import("../../src/server.ts").then((m) => m.default);
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
