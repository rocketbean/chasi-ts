import CompilerEngine from "../../package/framework/Compiler/compiler.js";
import { ServiceProviderInterface } from "../../package/framework/Interfaces.js";

export default class CompilerEngineServiceProvider
  implements ServiceProviderInterface
{
  async boot() {
    return CompilerEngine;
  }
}
