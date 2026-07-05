/**
 * Build / headless entry point.  ( npm run build → tsc && node ./dist/build.js )
 *
 * Sets the in-process build flag BEFORE the app boots, then imports the normal
 * server entry. The flag (`globalThis.__chasiBuild`) is read across the boot to:
 *   - force single-process (serviceCluster disabled),        [Session.initialize]
 *   - skip the pre-app compiler hook,                        [Session.beforeSessionHook]
 *   - run each provider's build() hook once routes are loaded,[Consumer.consumeLayers]
 *   - exit(0) instead of starting the HTTP server.           [Handler.boot]
 *
 * NOTE: uses a *dynamic* import so these lines run BEFORE server.ts boots —
 * a static `import` would be hoisted and evaluate the server first.
 *
 * chasi's own lifecycle logging is silenced in build mode by the Writer gate
 * (see Writer.silenced) — except while a provider build() hook runs — so build
 * output stays visible without the blunt Log_Level=0 hammer.
 */
globalThis.__chasiBuild = true;

await import("./server.js");
