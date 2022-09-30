import path from "path";
import { fileURLToPath } from "url";
import Builder from "./lib/Builder.js";
import devBundler from "./lib/devBundler.js";
import prodBundler from "./lib/prodBundler.js";
import { Iobject } from "../../../package/framework/Interfaces.js";
import Router from "../../../package/framework/Router/Router.js";
export { devBundler, prodBundler };
export { Builder };
export type builderConfig = {
  root: string;
  name: string;
  environment: string;
  configPath?: string;
  mountedTo?: string;
  serverBuild?: any;
  clientBuild?: any;
  ssrServerModule?: string;
  hook?: Function;
};

export type CompilerEngineConfig = {
  enabled: boolean;
  engines: builderConfig[];
};

export default class CompilerEngine {
  public $app;
  public builders: Builder[];
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
    this.builders = await Promise.all(
      this.config.engines.map(async (engine): Promise<Builder> => {
        return await new Builder(this.$app, engine).setup();
      }),
    );
  }

  async mount(router: Router, props) {
    if (router.property.prefix[0] !== "/")
      router.property.prefix = "/" + router.property.prefix;
    if (router.property.prefix[router.property.prefix.length - 1] !== "/")
      router.property.prefix += "/";
    let bundler = this.getBuilder(props[0]).bundler;
    bundler.rebase(router.property.prefix);
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
