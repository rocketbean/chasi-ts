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
   * BasePath for development[TS]
   * similar to default
   * __dirname
   */
  var __devDirname: string;

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

  var __deepEqual: Function;

  var _getMethods: Function;

  var $app: any;
}

export default (async () => {
  // console.clear();
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

  global.__devDirname = path.join(
    path.normalize(fileURLToPath(import.meta.url)),
    "../../../src",
  );

  global.__devFilepath = path.join(
    path.normalize(fileURLToPath(import.meta.url)),
    "../../",
  );

  global.__filepath = path.join(path.normalize(import.meta.url), "../../");

  global._getMethods = (obj) => {
    return Object.getOwnPropertyNames(obj).filter((item) => item);
  };

  global.Caveat = new ExceptionHandler();
  await ExceptionHandler.handleProcessError();

  /****
   * Default Property Accessors
   */
  global.__deepEqual = function (object1: Object, object2: Object) {
    const isObject = (object) => {
      return object != null && typeof object === "object";
    };
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    for (const key of keys1) {
      const val1 = object1[key];
      const val2 = object2[key];
      const areObjects = isObject(val1) && isObject(val2);
      if (
        (areObjects && !__deepEqual(val1, val2)) ||
        (!areObjects && val1 !== val2)
      ) {
        return false;
      }
    }
    return true;
  };
})();
