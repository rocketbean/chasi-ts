import chalk from "chalk";
import Writer, { Writable } from "./types/Writer.js";
import * as writers from "./types/writers.js";

const _writers: { [key: string]: any } = writers;

export default class Logger {
  static AllowPadding: string[] = ["warning", "severe", "subsystem"];

  static instance: Logger;

  public writers: { [key: string]: Writable } = {};

  private constructor() {
    Object.keys(_writers).map((key: string): void => {
      this.writers[key] = new _writers[key]();
    });
  }

  log(message: string, writer: string, display: string = "clear") {
    this.writers[writer].write(message, display);
  }

  writer(writer: string = "Left", subject: string = "logs"): Writer {
    return new _writers[writer](subject);
  }

  static init() {
    if (Logger.instance) return Logger.instance;
    Logger.instance = new Logger();
    return Logger.instance;
  }
}
