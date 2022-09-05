import CompilerEngine from "../../package/framework/Compiler/compiler.js";
import { ServiceProviderInterface } from "../../package/framework/Interfaces.js";
import Provider from "../../package/framework/Services/Provider.js";

export default class CompilerEngineServiceProvider
  extends Provider
  implements ServiceProviderInterface
{
  async boot() {
    return CompilerEngine;
  }
}
