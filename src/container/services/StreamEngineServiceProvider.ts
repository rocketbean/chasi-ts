import {
  ServiceProviderInterface,
  RouterConfigInterface,
} from "../../package/framework/Interfaces.js";
import Provider from "../../package/framework/Services/Provider.js";

export default class StreamEngineServiceProvider
  extends Provider
  implements ServiceProviderInterface
{
  async boot() {}
}
