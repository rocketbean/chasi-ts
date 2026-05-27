import { resolve, join } from "path";
import {
  CompilerEngineConfig,
  builderConfig,
  Builder,
} from "../container/modules/compilerEngine/compiler.js";

/**
 * Whether to run in Vite dev-server mode or serve a pre-built production bundle.
 * Switch to `"dev"` during active frontend development to get HMR.
 * Keep as `"prod"` in CI, staging, and when `serviceCluster.enabled` is `true`
 * (Vite's dev server is not cluster-safe).
 */
let environment: "dev" | "prod" = "prod";

// `__devDirname` points to the TypeScript source root (/src) in dev mode so
// Vite can watch source files and HMR directly. In prod, `___location` resolves
// to the compiled output root (/dist) and static files are served from there.
//@ts-ignore
let dirpath = environment == "dev" ? __devDirname : ___location;

/**
 * Compiler engine configuration.
 * Compiler engines are skipped entirely when `process.env.testMode === "enabled"`,
 * so tests never trigger a Vite build.
 */
const config: CompilerEngineConfig = {
  /**
   * Master switch for the compiler engine.
   * Set to `false` to disable all Vite compilation (e.g. API-only servers
   * that serve no frontend assets).
   */
  enabled: false,

  /**
   * List of Vite engine instances to manage.
   * Each entry maps a named Vite project to a router mount point and defines
   * how it is built for dev vs. prod.
   *
   * In `"dev"` mode, `vite.createServer()` is used — HMR is active and files
   * are served directly from the TypeScript source tree (`__devDirname`).
   * In `"prod"` mode, `vite.build()` runs first, then the compiled output in
   * `___location` is served as static files.
   *
   * Hooks declared on each engine are invoked during `server.hooks.beforeApp`.
   */
  engines: [
    {
      /**
       * Unique name for this engine instance.
       * Must match the `name` passed to `router.mount()` in the
       * `RouterServiceProvider` so Chasi knows which engine to attach
       * to which router.
       */
      name: "web",

      /**
       * Build mode for this engine.
       * `"dev"`  — starts Vite's dev server with HMR (not cluster-safe).
       * `"prod"` — runs a full Vite build and serves static output.
       * Should match the top-level `environment` variable above.
       */
      environment,

      /**
       * Absolute path to the Vite project root (the directory containing
       * `vite.config.js` / `ssr.config.js`).
       * In dev mode this points into `/src`; in prod into `/dist`.
       */
      root: join(dirpath, "container/html/web"),

      /**
       * Entry point for the SSR server bundle.
       * Vite compiles this file as the Node.js renderer that turns
       * Vue/React components into HTML strings for each request.
       */
      ssrServerModule: "entry-server.js",

      /**
       * Vite build options for the SSR server bundle.
       * `outDir` is relative to `root`. `ssr` points to the server entry file.
       * See: https://vitejs.dev/config/build-options
       */
      serverBuild: {
        outDir: "./.out/server",
        /** Clear the output directory before each build to avoid stale assets. */
        emptyOutDir: true,
        ssr: "./entry-server.js",
      },

      /**
       * Vite build options for the client-side bundle.
       * `manifest: true` generates a `manifest.json` used to inject hashed
       * asset URLs into SSR-rendered HTML. `ssrManifest` enables preload hints.
       */
      clientBuild: {
        outDir: "./.out/client",
        emptyOutDir: true,
        /** Required for SSR asset injection — do not disable. */
        manifest: true,
        ssrManifest: true,
      },

      /**
       * Absolute path to the Vite config file for this engine.
       * Supports a separate SSR-specific config (`ssr.config.js`) instead of
       * the default `vite.config.js`, letting you keep SSR options isolated.
       */
      configPath: resolve(join(dirpath, "container/html/web/ssr.config.js")),

      /**
       * The router prefix this engine is attached to.
       * Must match the `prefix` of the router declared in `RouterServiceProvider`.
       * Use `"/"` when the router has no prefix.
       * Chasi also uses this path as the base URL for serving compiled static files.
       */
      mountedTo: "/",

      /**
       * Called during `server.hooks.beforeApp` before Express starts accepting requests.
       * In `"prod"` mode: distributes the compiled bundle and runs `prodSetup` to
       * wire static file serving and the SSR renderer into Express.
       * Runs once on the primary process — not per worker — to avoid redundant builds
       * when `serviceCluster` is enabled.
       */
      hook: async (getConfig: Function, ctx: builderConfig): Promise<void> => {
        //@ts-ignore
        if (environment === "prod") await Builder.distribute(ctx.root); // execs only on TS
        await Builder.prodSetup(getConfig, ctx);
      },
    },
  ],
};

export default config;
