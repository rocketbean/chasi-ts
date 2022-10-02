import path from "path";
import { fileURLToPath } from "url";
import Builder from "./lib/Builder.js";
import devBundler from "./lib/devBundler.js";
import prodBundler from "./lib/prodBundler.js";
import { Iobject } from "../../../package/framework/Interfaces.js";
import Router from "../../../package/framework/Router/Router.js";
import { exit } from "process";
export { devBundler, prodBundler };
export { Builder };

export type builderConfig = {
  /** name -
   * required for matching up with routers.mount()
   */
  name: string;

  /** root -
   * vite project root.
   */
  root: string;

  /** environment -
   * [dev, prod] - type of builders to be server.
   */
  environment: "dev" | "prod";

  /** configPath -
   * string[vite.UserConfig] - path/to/*.config.js.
   */
  configPath?: string;

  /** mountedTo -
   * string[Router.prefix] - routers prefix where engine is mounted.
   */
  mountedTo?: string;

  /** serverBuild -
   * [vite.UserConfig.build] - build options for server[SSR].
   */
  serverBuild?: any;

  /** clientBuild -
   * [vite.UserConfig.build] - build options for client[SSR].
   */
  clientBuild?: any;

  /** ssrServerModule -
   * server entry
   */
  ssrServerModule?: string;

  /** hook["beforeApp"] -
   * will be called on production build,
   * the compiler will execute before the
   * app is initialized. this is improve performance
   * and to avoid multiple build execution
   * when serviceCluster [server.serviceCluster]
   * is enabled
   */
  hook?: Function;
};

export type CompilerEngineConfig = {
  enabled: boolean;
  engines: builderConfig[];
};

export default class CompilerEngine {
  public $app;
  public builders: Builder[] = [];
  static instance: CompilerEngine;
  private resolve: Function = (p, cwd = null) =>
    cwd == null ? path.resolve(__dirname, p) : path.resolve(cwd, p);

  public $staticPath: Iobject = {
    assets: "/assets/",
  };

  constructor(protected config: CompilerEngineConfig) {
    CompilerEngine.instance = this;
  }

  setInvoker(app) {
    this.$app = app;
  }

  getStaticRenders() {
    return Object.keys(this.$staticPath).map((stat) => {
      return {
        path: this.$staticPath[stat],
        root: this.resolve("../src/container/html/" + this.$staticPath[stat]),
      };
    });
  }

  getBuilder(builder: string): Builder {
    return this.builders.find((_b) => _b.name == builder);
  }

  async setupEngines() {
    if (this.config.enabled) {
      this.builders = await Promise.all(
        this.config.engines.map(async (engine): Promise<Builder> => {
          return await new Builder(this.$app, engine).setup();
        }),
      );
    }
  }

  async mount(router: Router, props) {
    if (this.config.enabled) {
      let prop = { ...router.property };
      let base = prop.prefix;
      if (base[0] !== "/") base = "/" + base;
      if (base[base.length - 1] !== "/") base += "/";
      let bundler = this.getBuilder(props[0])?.bundler;
      if (bundler) {
        bundler.rebase(base);
        await bundler.setup(this.$app);
        let routes = await bundler.routeRegistry();
        await router.collectEndpointFn((route) => {
          routes.forEach((r) => {
            route.dynamic(r.path, () => {}, props[0]);
          });
        });
        await bundler.routeRegistry();
      }
    }
  }
}
