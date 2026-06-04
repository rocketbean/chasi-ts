import RouteCollector from "./collectors/Routes.js";
import Compiler from "./Compiler.js";
import RouterModule from "../../../package/framework/Router/RouterModule.js";
import type { SdkBuilderConfig } from "./SdkBuilder.types.js";

// ─── SdkBuilder ──────────────────────────────────────────────────────────────

export default class SdkBuilder {
  public collector: RouteCollector;
  public compiler: Compiler;
  public static instance: SdkBuilder;

  private constructor(private readonly config: SdkBuilderConfig) {
    this.collector = new RouteCollector();
  }

  static getInstance(): SdkBuilder | undefined {
    return SdkBuilder.instance;
  }

  static async init(config: SdkBuilderConfig): Promise<SdkBuilder> {
    SdkBuilder.instance = new SdkBuilder(config);
    await SdkBuilder.instance.collector.init(config);
    SdkBuilder.instance.compiler = new Compiler(
      config,
      SdkBuilder.instance.collector
    );
    return SdkBuilder.instance;
  }

  async compile(): Promise<void> {
    await this.compiler.compile();
  }

  /**
   * Empties `$sdkHandlers` on every registered endpoint after the SDK file
   * has been written. This guarantees that sdk() content never runs during
   * normal server operation — handlers exist only for the build phase and
   * the generated bundle, nowhere else.
   */
  clearSdkHandlers(): void {
    const routerModule = ($app as { $modules: { RouterModule: RouterModule } })
      .$modules.RouterModule;

    for (const router of routerModule.routers) {
      for (const endpoint of router.$registry.routes) {
        endpoint.$sdkHandlers = [];
      }
    }
  }
}
