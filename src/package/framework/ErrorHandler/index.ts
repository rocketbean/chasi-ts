import { appendFile } from "fs";
import Base from "../../Base.js";
import { genericImport, ExceptionProperty } from "../Interfaces.js";
import Exception from "./Exception.js";
import APIException from "./exceptions/APIException.js";
export default class ErrorHandler extends Base {
  static errors: Exception[] = [];
  static exceptions: { [key: string]: Exception };

  /**
   * Error Response types:
   *              ---------------------------------------
   * [1]Log      | immediately logs the error,
   * [2]Warn     | only show logs when checked,
   * [3]Break    | drops the invoker instance,
   * [4]Stop     | stops the parent invoker,
   * [5]severe   | breaks all the process
   *              ---------------------------------------
   */
  static _severity: string[] = ["log", "warn", "break", "stop", "severe"];

  constructor() {
    super();
  }

  handle(property: ExceptionProperty | string, exception: string) {
    if (typeof property == "string") property = { message: property };
    return new APIException(property as ExceptionProperty);
  }

  static async handleProcessError() {
    process.on("exit", (code) => {
      console.log(`process is exiting with :code[${code}] `);
    });

    process.on("uncaughtException", function (err, origin) {
      console.log("Exception", err);
    });

    process.on("unhandledRejection", function (reason, promise) {
      console.log("unhandled rejection. hm", promise);
    });
  }
}
