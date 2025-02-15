import chalk from "chalk";
import Writer, { Writable } from "./types/Writer.js";
import * as writers from "./types/writers.js";
import { inspect } from "util";
import cluster from "cluster";
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
    Logger.board = v;
  }

  log(...message: any) {
    let wr = this.writer("Left");
    message.forEach((msg, ind) => {
      if (typeof msg === "object")
        msg = inspect(msg, {
          showHidden: false,
          depth: null,
          colors: true,
        });
      if (ind > 0) wr.write("\n");
      wr.write(msg + "\n");
    });
  }

  clusterLogSystem(worker, ...message) {
    let wr = this.writer("Left")
    wr.write(`LOG_PID[${worker.pid}:${worker.id}] >>`, "system")
    message.forEach((msg, ind) => {
      if (typeof msg === "object")
        msg = inspect(msg, {
          showHidden: false,
          depth: 0,
          colors: true,
        });
      if (ind > 0) wr.write("\n");
      wr.write(msg + "\n", "positive");
    });
  }

  clusterLog(worker, ...message) {
    let writer = this.writer("LeftFull")
    let wr = this.writer("Left")
    writer.write(`LOG_PID[${worker.pid}:${worker.id}]`, "system")
    message.forEach((msg, ind) => {
      if (typeof msg === "object")
        msg = inspect(msg, {
          showHidden: false,
          depth: 0,
          colors: true,
        });
      if (ind > 0) wr.write("\n");
      wr.write(msg + "\n\n");
    });
  }

  writer(writer: string = "Left", subject: string = "logs"): Writer {
    return new _writers[writer](subject);
  }

  static init(): Logger {
    if (Logger.instance) return Logger.instance;
    Logger.instance = new Logger();
    return Logger.instance;
  }
}
