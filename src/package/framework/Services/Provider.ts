import { Handler } from "../../Handler.js";

export default class Provider {
  protected static $observer;
  protected static $pipe = null;
  static init() {
    let { $observer } = Handler.Instance;
    Provider.$observer = $observer;
    if (Handler.Instance?.pipe) Provider.$pipe = Handler.Instance.pipe;
  }
}
