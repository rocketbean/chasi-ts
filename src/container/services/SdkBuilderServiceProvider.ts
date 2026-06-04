import { ServiceProviderInterface } from "../../package/framework/Interfaces.js";
import Provider from "../../package/framework/Services/Provider.js";
import SdkBuilder from "../modules/SdkBuilder/SdkBuilder.js";
import type { SdkBuilderConfig } from "../modules/SdkBuilder/SdkBuilder.types.js";

export default class SdkBuilderServiceProvider
  extends Provider
  implements ServiceProviderInterface
{
  async boot(): Promise<void> {}

  async beforeServerBoot(): Promise<void> {
    const config: SdkBuilderConfig = Provider.config.sdkbuilder;

    if (!config?.enabled) return;

    await SdkBuilder.init(config);
    await SdkBuilder.instance.compile();
    SdkBuilder.instance.clearSdkHandlers();
  }
}
