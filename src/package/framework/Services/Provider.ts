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
}
