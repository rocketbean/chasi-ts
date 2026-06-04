import { ServiceProviderInterface } from "../../package/framework/Interfaces.js";
import Provider from "../../package/framework/Services/Provider.js";
import ApiSpec from "../modules/ApiSpecs/spec.js";
import type { ApiSpecConfig } from "../modules/ApiSpecs/ApiSpec.types.js";

export default class ApiSpecServiceProvider
  extends Provider
  implements ServiceProviderInterface
{
  async boot(): Promise<void> {}

  async beforeServerBoot(): Promise<void> {
    const config: ApiSpecConfig = Provider.config.apispec;

    if (!config?.enabled) return;

    await ApiSpec.init(config);
    await ApiSpec.instance.compile();
  }
}
