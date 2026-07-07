import Writer, { Writable } from "./types/Writer.js";
import * as writers from "./types/writers.js";
import { inspect } from "util";
const _writers: { [key: string]: any } = writers;

/**
 * A function bound to the Logger's write methods via container config
 * (`LoggerBindings`). Runs after each write method with the method's name
 * followed by the exact arguments that method received.
 */
export type LoggerBinding = (method: string, ...args: unknown[]) => void;

export default class Logger {
  static AllowPadding: string[] = ["warning", "severe", "subsystem"];

  static instance: Logger;

  /** Write methods that fire the configured bindings. */
  static readonly WriteMethods = ["log", "info", "warn", "error"] as const;

  /** Functions run after every write method, in declaration order (from config). */
  static bindings: LoggerBinding[] = [];

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

  log(...message: unknown[]): void {
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

  info(...message: unknown[]): void {
    let wr = this.writer("Left");
    message.forEach((msg, ind) => {
      if (typeof msg === "object")
        msg = inspect(msg, {
          showHidden: false,
          depth: null,
          colors: true,
        });
      if (ind > 0) wr.write("\n");
      wr.write("ℹ " + msg + "\n", "adjusted");
    });
  }

  warn(...message: unknown[]): void {
    let wr = this.writer("Left");
    message.forEach((msg, ind) => {
      if (typeof msg === "object")
        msg = inspect(msg, {
          showHidden: false,
          depth: null,
          colors: true,
        });
      if (ind > 0) wr.write("\n");
      wr.write("⚠ " + msg + "\n", "warning");
    });
  }

  error(...message: unknown[]): void {
    let wr = this.writer("Left");
    message.forEach((msg, ind) => {
      if (typeof msg === "object")
        msg = inspect(msg, {
          showHidden: false,
          depth: null,
          colors: true,
        });
      if (ind > 0) wr.write("\n");
      wr.write("✖ " + msg + "\n", "severe");
    });
  }

  clusterLogSystem(worker: { pid: number; id: number }, ...message: unknown[]): void {
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

  clusterLog(worker: { pid: number; id: number }, ...message: unknown[]): void {
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

  /**
   * Register functions (from container config `LoggerBindings`) to run after
   * every Logger write method. Each is invoked with the method name and the
   * exact arguments the method received, in declaration order. Safe to call at
   * any time; a later call replaces the current set. Non-functions are ignored.
   */
  static setBindings(bindings?: LoggerBinding[] | LoggerBinding): void {
    Logger.bindings = !bindings
      ? []
      : (Array.isArray(bindings) ? bindings : [bindings]).filter(
          (fn): fn is LoggerBinding => typeof fn === "function",
        );
  }

  /** Run every binding for a write; a throwing binding never breaks logging. */
  private static fire(method: string, args: unknown[]): void {
    for (const fn of Logger.bindings) {
      try {
        fn(method, ...args);
      } catch {
        /* a binding must never break logging */
      }
    }
  }

  /**
   * Wrap each write method (once, on the singleton) so it fires the configured
   * bindings with the method name + its exact args after the write completes.
   */
  private applyBindings(): void {
    for (const name of Logger.WriteMethods) {
      const self = this as Record<string, any>;
      const original = self[name];
      if (typeof original !== "function") continue;
      self[name] = (...args: unknown[]): unknown => {
        const result = original.apply(this, args);
        Logger.fire(name, args);
        return result;
      };
    }
  }

  static init(): Logger {
    if (Logger.instance) return Logger.instance;
    Logger.instance = new Logger();
    Logger.instance.applyBindings();
    return Logger.instance;
  }
}
