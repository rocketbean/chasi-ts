import "./package/helper.js";
import Base from "./package/Base.js";
import { Handler } from "./package/Handler.js";
import Session from "./package/framework/Chasi/Session.js";
import cluster from "cluster";
import os from "os";
export default await (async <T>(): Promise<Handler> => {
  return await Session.initialize(await Base.Ignition());
})();
