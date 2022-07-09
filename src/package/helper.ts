import env from "dotenv";
import Logger from "./Logger/index.js";
import path from "path";
import { fileURLToPath } from "url";

declare global {
  var checkout: (val: any, backup: any) => {};
  var Logger: Logger;
  var __dirname: string;
  var __filepath: string;
  var _configpath_: string;
}

export default (async () => {
  console.clear();
  env.config();
  global.checkout = (val: any, backup: any) => {
    if (val == undefined || val == null) return backup;
    else return val;
  };
  global.Logger = Logger.init();
  global.__dirname = path.join(
    path.normalize(fileURLToPath(import.meta.url)),
    "../../",
  );
  global._configpath_ = "config";
  global.__filepath = path.join(path.normalize(import.meta.url), "../../");
})();
