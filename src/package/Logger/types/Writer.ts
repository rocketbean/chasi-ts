import chalk from "chalk";
import logStyles from "../styles/style.js";
import Group from "../Group.js";
import util from "util";
import readline from "readline";
import { urlToHttpOptions } from "url";
import { exit } from "process";

export default abstract class Writer {
  static log: Function = () => {};

  logType: { [key: string]: Function } = logStyles;
  static groups: Group[] = [];
  spacer: string = " ";
  groups: Group[] = [];
  displayAs: Function = this.logType.clear;

  constructor(public subject: string = "logs") {
    this.subject = subject;
  }

  abstract format(message: string, b?: string, c?: string | number): void;

  protected fill(space: number, spacer: string = " "): string {
    if (space <= 0) return "";
    if (spacer !== " ") return spacer.repeat(space);
    return this.spacer.repeat(space);
  }

  get cols() {
    // process.stdout.columns is undefined in cluster workers (stdout is /dev/null).
    // Fall back to TERM_COLS injected by the primary at fork time.
    // Subtract 3 to match the "   " prefix Storage adds before every entry —
    // full-width formatters (Full, EndTraceFull, LeftFull) pad to exactly cols
    // chars, so without this reservation they overflow by 3 and wrap.
    const cols = process.stdout.columns || Number(process.env.TERM_COLS) || 100;
    return cols - (Writer.groups.length * 2) - 3;

  style(key: string): Writable {
    this.displayAs = this.logType[key];
    return this;
  }

  /***
   * command line loading
   *
   */
  loading(message: string = "", finalMessage: string = ""): { start: () => void; stop: (m?: string, subj?: string) => void } {
    this.spacer = " ";
    let timer: NodeJS.Timeout;
    const _wr = process.stdout;
    const start = (): void => {
      const P = ["\\", "|", "/", "-", "*"];
      let x = 0;
      timer = setInterval(() => {
        x++;
        trs(chalk.bold.yellow(message + " ") + chalk.bold.yellow(P[x]));
        x %= P.length - 1;
      }, 50);
    };
    const stop = ((m?: string, subj?: string): void => {
      readline.cursorTo(_wr, 0);
      readline.clearLine(_wr, 0);
      if (finalMessage.length > 0) {
        this.write("\r" + chalk.bold.yellow(m), "clear", "database");
      }
      clearInterval(timer);
    }).bind(this);

    const trs = ((m: string): void => {
      const indention = this.fill(process.stdout.columns - this.cols);
      _wr.write(`\r ${indention} ${m}`);
    }).bind(this);
    return { start, stop };
  }

  write(message: any, display: string = "clear", subject?: string): void {
    if (subject == undefined || subject == null || !subject)
      subject = this.subject;
    if (typeof message !== "object") {
      message = this.logType[display](this.format(message));
    } else {
      message = util.inspect(message, {
        showHidden: false,
        depth: null,
        colors: true,
      });
    }
    if(Number(checkout( process.env["Log_Level"], 2)) > 0 ) Writer.log(message, subject);
  }

  drawAs(
    message: string,
    draw: Function,
    formatStr: boolean = true,
    subject?: string,
  ) {
    let parsedStr: any = message;
    if (!subject) subject = this.subject;
    if (formatStr) parsedStr = this.format(message);
    if(Number(checkout( process.env["Log_Level"], 2)) > 0 ) Writer.log(draw(parsedStr), subject);
  }

  group(label: string = " ") {
    Writer.groups.unshift(new Group(label));
  }

  endGroup(label: string = " ") {
    Writer.groups = Writer.groups.filter((group) => {
      if (group.name == label) {
        group.end();
      }
      return group.name != label;
    });
  }

  endGroups() {
    Writer.groups = Writer.groups.filter((group) => {
      group.end();
    });
  }
}

export interface Writable {
  write(a?: string | object, b?: string, c?: string): void;
  format(a?: string, b?: string): string | void;
  group(a: string): void;
  endGroup(a: string): void;
  endGroups(): void;
  style(a: string): Writable;
  loading(a: string, b?: string): { start: () => void; stop: (m?: string, subj?: string) => void };
}
