import { resolve, join } from "path";
import {
  CompilerEngineConfig,
  builderConfig,
  Builder,
} from "../container/modules/compilerEngine/compiler.js";

let environment: "dev" | "prod" = "prod";
//@ts-ignore
let dirpath = environment == "dev" ? __devDirname: ___location;

/***
 * @type {CompilerEngineConfig}
 * Compiler Engines will
 * not compile on testMode
 * process.env["testMode"] == 'enabled'.
 */
const config: CompilerEngineConfig = {
  enabled: true,
  /*** engines[]
   * @type {builderConfig[]}
   * vite instance/s must be registered here.
   * ----------------------------------------
   * - __devDirname[ts_path[/src]] will be served
   * in vite.createViteServer()
   * to enable vite's HMR upon updating vite files
   * inside ts directory.
   * - ___location[js_path[/dist]] will be served
   * as static build, please note that
   * vite's HMR is disabled if on prod.
   * ----------------------------------------
   * ♦ hook: Function[config.server.hooks.beforeApp] - hooks to be
   * invoked on beforeApp() event.
   */
  engines: [
    {
      /** Name
       * required for matching up with routers.mount()
       * RouterServiceProvider[route.props]
       */
      name: "web",

      /** environment
       * [dev, prod] - type of builders to be server.
       * * * * * * * NOTE * * * * * *
       * it is recommended that environment
       * is set to "prod" if clusters
       * is enabled
       */
      environment,

      /** root
       * vite project root.
       */
      root: join(dirpath, "container/html/web"),

      /** ssrServerModule
       * server entry
       */
      ssrServerModule: "entry-server.js",

      /** serverBuild
       * [vite.UserConfig.build] - build options for server[SSR].
       */
      serverBuild: {
        outDir: "./.out/server",
        emptyOutDir: true,
        ssr: "./entry-server.js",
      },

      /** clientBuild
       * [vite.UserConfig.build] - build options for client[SSR].
       */
      clientBuild: {
        outDir: "./.out/client",
        emptyOutDir: true,
        manifest: true,
        ssrManifest: true,
      },

      /** configPath
       * string[vite.UserConfig] - path/to/*.config.js.
       */
      configPath: resolve(join(dirpath, "container/html/web/ssr.config.js")),

      /** mountedTo 
       * string[@Router.prefix] - routers prefix where engine is mounted.
       * this must be pointed to the router's prefix
       * set to "/" if prefix is not declared.
       * this path will also be used for serving static files
       * after a compilation
       */
      mountedTo: "/",

      /**** hook
       * hook["beforeApp"] will be called on production build,
       * the compiler will execute before the
       * app is initialized. this is to improve performance
       * and to avoid multiple build execution
       * when serviceCluster [server.serviceCluster]
       * is enabled.
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
