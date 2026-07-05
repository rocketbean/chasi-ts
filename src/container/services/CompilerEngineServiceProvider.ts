import Provider from "../../package/framework/Services/Provider.js";
import CompilerEngine, {CompilerEngineConfig} from "../modules/compilerEngine/compiler.js";
import { ServiceProviderInterface} from "../../package/framework/Interfaces.js";

export default class CompilerEngineServiceProvider extends Provider implements ServiceProviderInterface
{
  constructor(public compiler: CompilerEngine) {
    super();
    this.compiler = new CompilerEngine(
      CompilerEngineServiceProvider.config.compiler as CompilerEngineConfig
    );
  }

  async boot() {
    return this.compiler;
  }

  async beforeServerBoot($app: any) {
    this.compiler.setInvoker($app);
    await this.compiler.setupEngines();
  }

  async build(): Promise<void> {
    const config = Provider.config.compiler;
    if (!config?.enabled) return;
    // Run each engine's hook (distribute + prodSetup = copy source + Vite build)
    // — the same work beforeApp does at runtime, which build mode otherwise skips.
    // (setupEngines only instantiates the builders; it does not build.)
    const getConfig = (name: string) => Provider.config[name];
    await Promise.all(
      config.engines.map((engine: any) => engine.hook(getConfig, engine))
    );
  }
}
