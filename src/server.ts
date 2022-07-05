import "./package/helper.js";
import Base from "./package/Base.js";
import { Handler } from "./package/Handler.js";

export default (async <T>(): Promise<Handler> => {
  return await Handler.init(await Base._fetchFilesFromDir(_configpath_));
})();
