import env from "dotenv";
import Logger from "./Logger/index.js";
import ExceptionHandler from "./framework/ErrorHandler/index.js";
import path from "path";
import { fileURLToPath } from "url";
declare global {
  /**
   * used for getting
   * [env]vars
   */
  var checkout: Function;

  /***
   * pointing to Logger::class
   * "./Logger"
   */
  var Logger: Logger;

  /**
   * ChasiGlobal for
   * ErrorHandling as
   * the framework intend
   * to avoid unintentional
   * interferance of the process
   */
  var Caveat: ExceptionHandler;

  /**
   * BasePath
   * similar to default
   * __dirname
   */
  var __dirname: string;

  /**
   * this path just
   * ensures that the path
   * included can be used for
   * getting files
   */
  var __filepath: string;

  /**
   * the Chasi::configuration
   * path directory
   */
  var _configpath_: string;

  var $app: any;
}

export default (async () => {
  console.clear();
  env.config();
  var configPath = "config";
  global._configpath_ = configPath;

  global.checkout = (val: any, backup: any) => {
    if (val == undefined || val == null) return backup;
    else return val;
  };

  global.Logger = Logger.init();

  global.__dirname = path.join(
    path.normalize(fileURLToPath(import.meta.url)),
    "../../",
  );

  global.__filepath = path.join(path.normalize(import.meta.url), "../../");

  global.Caveat = new ExceptionHandler();
  await ExceptionHandler.handleProcessError();
})();
