import Exception from "./Exception.js";

export default class ErrorHandler {
  static errors: Exception[] = [];
  static all: Exception[] = [];
  /**
   * Error Response types:
   *          ---------------------------------------
   * Log      | immediately logs the error Logger::class ,
   * Warn     | only show logs when checked,
   * Break    | drops the invoker instance,
   * Stop     | stops the parent invoker,
   * severe   | breaks all the process
   *          ---------------------------------------
   */
  static _severity: string[] = ["log", "warn", "break", "stop", "severe"];
}
