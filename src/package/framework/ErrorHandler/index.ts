import Base from "../../Base.js";
import chalk from "chalk";
import Exception from "./Exception.js";
import APIException from "./exceptions/APIException.js";
import ChasiException from "./exceptions/APIException.js";
import ExceptionLogger from "./ExceptionLogger.js";
import Observer from "../../Observer/index.js";
import { genericImport, ExceptionProperty, Iobject } from "../Interfaces.js";
import { Handler } from "../../Handler.js";

export default class ErrorHandler extends Base {
  static errors: Exception[] = [];
  static exceptions: { [key: string]: any } = {
    ChasiException,
    APIException,
  };
  public config: Iobject;
  public logger: ExceptionLogger;
  public $observer: Observer;
  private $app: Handler;

  /**
   * Error Response types: [2] as default
   *              ---------------------------------------
   * [1]Log      | immediately logs the error,
   * [2]Warn     | only show logs after app is booted,
   * [3]Break    | drops the invoker instance [*]
   * [4]Stop     | stops the parent invoker [*]
   * [5]severe   | breaks all the process [*]
   *              ---------------------------------------
   */
  static _severity: string[] = ["log", "warn", "break", "stop", "severe"];

  /**
   * returns an exception class
   * pre-formated error or
   * warning module for Chasi
   * @param property [ExceptionProperty]type options and configurations for the exception
   * @param exception [string] type of exception;
   * @returns Exception::class
   */
  handle(
    property: ExceptionProperty | string | Iobject | Error,
    exception?: string,
  ) {
    if (typeof property == "string") property = { message: property };
    if (!exception) exception = "ChasiException";
    return new ErrorHandler.exceptions[exception](
      property as ExceptionProperty,
    );
  }

  /**
   * adding events that will
   * fire when Exception
   * occured
   */
  fireOnCommit($ev: any) {
    ErrorHandler.errors.push($ev);
  }

  /**
   * collecting exceptions from Registry
   * and fetching [Exception]class files
   * for registration at
   * ErrorHandler[exceptions]
   */
  async registerExceptions() {
    await Promise.all(
      Object.keys(this.config.registry).map(async (key: string) => {
        ErrorHandler.exceptions[key] = await this.fetchFile(
          this.config.registry[key],
        );
      }),
    );
  }

  /**
   * setting default app
   * behavior on handling
   * errors
   */
  static async handleProcessError() {
    process.on("exit", (code) => {
      console.error(
        chalk.yellow(
          `\n----♦ process exited with code [${code}], waiting for re establishing instance`,
        ),
      );
    });

    process.on("uncaughtException", function (err, origin) {
      console.error(err);
    });

    process.on("unhandledRejection", function (reason, promise) {
      console.error(reason);
    });
  }

  /**
   * initializes the ErrorHandler class
   * @param config Objects from config/exceptions file
   * @param $app Proxy handler
   */
  async init(config: Iobject, $app: Handler) {
    this.config = config;
    this.$app = $app;
    await this.registerExceptions();
    this.logger = new ExceptionLogger(config);
    this.$observer = $app.$observer;
    Exception.init(this.$observer);
    this.config.events.forEach((ev) => {
      this.$observer.emitter.on(ev, this.fireOnCommit.bind(this));
    });
  }
}
