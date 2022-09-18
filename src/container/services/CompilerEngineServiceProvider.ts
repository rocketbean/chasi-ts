import CompilerEngine from "../modules/compilerEngine/compiler.js";
import {
  Iobject,
  ServiceProviderInterface,
} from "../../package/framework/Interfaces.js";
import Provider from "../../package/framework/Services/Provider.js";
import serveStatic from "serve-static";

export default class CompilerEngineServiceProvider
  extends Provider
  implements ServiceProviderInterface
{
  constructor(public engine: CompilerEngine) {
    super();
    this.engine = new CompilerEngine();
  }

  async boot() {
    await this.engine.builder.raw();
    return this.engine;
  }

  async beforeServerBoot($app: any) {
    await Promise.all(
      this.engine.getStaticRenders().map((stat: Iobject) => {
        $app.use(`/test${stat.path}`, serveStatic(stat.root, { index: false }));
      }),
    );
    $app.use(this.engine.builder.transpiler.middlewares);
  }
}
