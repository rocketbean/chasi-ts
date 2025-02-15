import { Handler } from "../../Handler.js";
import { ModelCollection } from "../Database/Models.js";
export default class Provider {
  protected static $observer;
  protected static $pipe = null;
  protected static config;
  protected static models = ModelCollection;
  static init() {
    let { $observer, _config } = Handler.Instance;
    Provider.$observer = $observer;
    Provider.config = _config;
    if (Handler.Instance?.pipe) Provider.$pipe = Handler.Instance.pipe;
  }

  static getServices() {
    return Object.keys(Handler.Instance.$services);
  }

  static inject<T>($module): T {
    if (!Handler.Instance.$services[$module]) throw new Error(`ProviderErr:: unable to inject module[${$module}], module cannot be found`)
    return <T>Handler.Instance.$services[$module];
  }
}
