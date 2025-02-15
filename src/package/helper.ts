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
   * ___location
   */
  var ___location: string;

  /**
   * BasePath for development[TS]
   * similar to default
   * ___location
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
   * server basepath
   */
  var __basepath: string;


  var __testMode: Function

  /**
   * the Chasi::configuration
   * path directory
   */
  var _configpath_: string;

  var __deepEqual: Function;

  var __deepMerge: Function;

  var _getMethods: Function;

  var __getRandomStr: Function;

  var __getRandomNum: Function;

  var $app: any;

}

export default (async () => {
  env.config();
  var configPath = "config";
  global._configpath_ = configPath;

  global.__testMode = () => process.env["testMode"] == "enabled";
  global.checkout = (val: any, backup: any) => {
    if (val == undefined || val == null) return backup;
    else return val;
  };

  global.Logger = Logger.init();

  global.___location = path.join(
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

  global.__getRandomStr = (length: number) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  global.__getRandomNum = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

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

  global.__deepMerge = function (target, ...sources) {
    function isObject(item) {
      return (item && typeof item === 'object' && !Array.isArray(item));
    }

    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
      for (const key in source) {
        if (isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          __deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
    return __deepMerge(target, ...sources);

  }
})();
