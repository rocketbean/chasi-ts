import Observer from "../../Observer/index.js";
import { ExceptionProperty, ExceptionLoggerInterface } from "../Interfaces.js";
import ExceptionLogger from "./ExceptionLogger.js";

export default class Exception extends Error {
  public invoker: any;

  public logger: ExceptionLoggerInterface = new ExceptionLogger.writers[
    "terminal"
  ]();

  public static $observer: Observer;
  public logged: boolean = false;

  public commonInvoker: string[] = [
    "ErrorHandler.handle",
    "Server/Consumer",
    "processTicksAndRejections",
  ];

  /**
   * @param property [ExceptionProperty]
   * from "./@config/exceptions.js"
   * config file
   */
  constructor(public property: ExceptionProperty) {
    super(property.message);
    if (property instanceof Error) this.stack = property.stack;
    if (!property.hasOwnProperty("showStack")) this.property.showStack = true;
    const actualProto = new.target.prototype;
    this.commonInvoker.push(this.constructor.name);
    this.commonInvoker.push(property.message);
    this.invoker = this.setInvoker();
    Object.setPrototypeOf(this, new.target.prototype);
    this.property = property;
    Exception.$observer.emit("__exception__", {
      exception: this,
    });
  }

  /**
   * ExceptionHandler will
   * try to find where the error originates
   * by examining Error callstack
   * @returns Invoker as ErrorConstructor
   */
  setInvoker() {
    let stack = this.stack
      .split("\n")
      .filter(
        (line: string) =>
          !this.commonInvoker.find((common) => line.includes(common)),
      )[0];
    let checkPath = stack.split("/");
    if (checkPath.length > 0) {
      let path = checkPath[checkPath.length - 1]
        .replace(/\)|\(|.js/g, "")
        .split(":");
      return `${path[0]}:${path[1]}`;
    }
    return this.constructor.name;
  }

  /**
   * calls the write method
   * of a specified ExceptionWriter
   * @param includeStack ErrorStack
   */

  log() {
    let message = `[${this.invoker}] ${this.message}`;
    if (this.property.showStack) this.logger.write(message, this.stack);
    else this.logger.write(message);
  }

  static async init($observer: Observer) {
    Exception.$observer = $observer;
  }
}
