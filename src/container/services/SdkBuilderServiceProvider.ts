import { ServiceProviderInterface } from "../../package/framework/Interfaces.js";
import Provider from "../../package/framework/Services/Provider.js";
import SdkBuilder from "../modules/SdkBuilder/SdkBuilder.js";
import type { SdkBuilderConfig } from "../modules/SdkBuilder/SdkBuilder.types.js";

export default class SdkBuilderServiceProvider
  extends Provider
  implements ServiceProviderInterface
{
  async boot(): Promise<void> {}

  /**
   * Runtime generation (server boot). Skipped in build mode — build() handles it.
   * Cluster-safe: only the sole process or the lead worker generates, and it's
   * fire-and-forget so it never blocks the server from coming up.
   */
  async beforeServerBoot(): Promise<void> {
    if (globalThis.__chasiBuild) return; // build mode → handled by build()

    const config: SdkBuilderConfig = Provider.config.sdkbuilder;
    if (!config?.output?.length) return;

    const clustered = Provider.config.server?.serviceCluster?.enabled;
    const runsOnce = !clustered || process.env.lead === "1";
    if (runsOnce) void SdkBuilder.build(config); // fire-and-forget at runtime
  }

  /**
   * Build-mode generation (npm run build). Awaited so the build waits for the
   * files to be written before the process exits.
   */
  async build(): Promise<void> {
    const config: SdkBuilderConfig = Provider.config.sdkbuilder;
    if (!config?.output?.length) return;

    await SdkBuilder.build(config);
  }
}
