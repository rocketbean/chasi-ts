import "./package/helper.js";
import Base from "./package/Base.js";
import { Handler } from "./package/Handler.js";
export default await (async <T>(): Promise<Handler> => {
  return await Handler.init(await Base.Ignition());
})();
