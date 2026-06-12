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
  enabled: true,

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
      name: "web",
      environment,
      root: join(dirpath, "container/html/web"),
      ssrServerModule: "entry-server.js",
      serverBuild: {
        outDir: "./.out/server",
        emptyOutDir: true,
        ssr: "./entry-server.js",
      },
      clientBuild: {
        outDir: "./.out/client",
        emptyOutDir: true,
        manifest: true,
        ssrManifest: true,
      },
      configPath: resolve(join(dirpath, "container/html/web/ssr.config.js")),
      mountedTo: "/",
      hook: async (getConfig: Function, ctx: builderConfig): Promise<void> => {
        //@ts-ignore
        if (environment === "prod") await Builder.distribute(ctx.root);
        await Builder.prodSetup(getConfig, ctx);
      },
    },
  ],
};

export default config;
