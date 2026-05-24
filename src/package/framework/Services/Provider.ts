import { Handler } from "../../Handler.js";
import { ModelCollection } from "../Database/Models.js";
import Observer from "../../Observer/index.js";
import PipeHandler from "../Chasi/PipeHandler.js";
import { Iobject } from "../Interfaces.js";
export default class Provider {
  protected static $observer: Observer;
  protected static $pipe: PipeHandler | null = null;
  protected static config: Iobject;
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
