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
}
