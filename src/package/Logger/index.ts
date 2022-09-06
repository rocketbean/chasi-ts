import chalk from "chalk";
import Writer, { Writable } from "./types/Writer.js";
import * as writers from "./types/writers.js";

const _writers: { [key: string]: any } = writers;

export default class Logger {
  static AllowPadding: string[] = ["warning", "severe", "subsystem"];

  static instance: Logger;

  public writers: { [key: string]: Writable } = {};

  public static board: any;

  private constructor() {
    Object.keys(_writers).map((key: string): void => {
      this.writers[key] = new _writers[key]("logs");
    });
  }

  get board() {
    return Logger.board;
  }

  set board(v) {
    console.log(v);
    Logger.board = v;
  }

  log(message: any, writer: string = "Left", display: string = "clear") {
    let wr = this.writer(writer);
    wr.write(message, display);
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
