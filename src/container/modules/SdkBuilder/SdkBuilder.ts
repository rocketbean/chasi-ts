import RouteCollector from "./collectors/Routes.js";
import Compiler from "./Compiler.js";
import RouterModule from "../../../package/framework/Router/RouterModule.js";
import type { SdkBuilderConfig, SdkBuilderOutput } from "./SdkBuilder.types.js";

// ─── SdkBuilder ──────────────────────────────────────────────────────────────

export default class SdkBuilder {
  /** Every built output, keyed by its unique namespace. */
  public static instances: Map<string, SdkBuilder> = new Map();

  public collector: RouteCollector;
  public compiler: Compiler;

  private constructor(public readonly output: SdkBuilderOutput) {
    this.collector = new RouteCollector();
  }

  static getInstance(namespace: string): SdkBuilder | undefined {
    return SdkBuilder.instances.get(namespace);
  }

  /**
   * Builds every enabled output in the config. Each output is collected and
   * compiled independently into its own file, keyed by a unique `namespace`.
   * Entries with no namespace, or a duplicate namespace, are skipped with a
   * warning; a filename reused across outputs is warned about too.
   *
   * sdk() handlers are cleared exactly once, AFTER all outputs are compiled, so
   * every output still sees them during its own build-phase validation.
   */
  static async build(config: SdkBuilderConfig): Promise<void> {
    SdkBuilder.instances.clear();

    const seenNamespaces = new Set<string>();
    const seenFilenames = new Set<string>();

    for (const output of config.output ?? []) {
      if (!output.namespace) {
        Logger.log(`[SdkBuilder] output skipped — missing "namespace"`);
        continue;
      }
      if (seenNamespaces.has(output.namespace)) {
        Logger.log(
          `[SdkBuilder] output skipped — duplicate namespace "${output.namespace}"`
        );
        continue;
      }
      seenNamespaces.add(output.namespace);

      if (!output.enabled) continue;

      if (output.filename && seenFilenames.has(output.filename)) {
        Logger.log(
          `[SdkBuilder] "${output.namespace}" writes to "${output.filename}" — already used by another output; it will be overwritten`
        );
      }
      seenFilenames.add(output.filename);

      const instance = new SdkBuilder(output);
      await instance.collector.init(output);
      instance.compiler = new Compiler(output, instance.collector);
      await instance.compiler.compile();

      SdkBuilder.instances.set(output.namespace, instance);
    }

    // Clear sdk() handlers once, after ALL outputs have been compiled.
    if (SdkBuilder.instances.size > 0) SdkBuilder.clearSdkHandlers();
  }

  /**
   * Empties `$sdkHandlers` on every registered endpoint after all SDK files
   * have been written. This guarantees that sdk() content never runs during
   * normal server operation — handlers exist only for the build phase and the
   * generated bundle, nowhere else.
   */
  static clearSdkHandlers(): void {
    const routerModule = ($app as { $modules: { RouterModule: RouterModule } })
      .$modules.RouterModule;

    for (const router of routerModule.routers) {
      for (const endpoint of router.$registry.routes) {
        endpoint.$sdkHandlers = [];
      }
    }
  }
}
