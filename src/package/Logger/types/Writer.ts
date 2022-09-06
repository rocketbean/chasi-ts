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
    return process.stdout.columns - Writer.groups.length * 2;
  }

  style(key: string): Writable {
    this.displayAs = this.logType[key];
    return this;
  }

  /***
   * command line loading
   *
   */
  loading(message: string = "", finalMessage = "") {
    this.spacer = " ";
    let timer;
    let _wr = process.stdout;
    let start = () => {
      var P = ["\\", "|", "/", "-", "*"];
      var x = 0;
      timer = setInterval(() => {
        x++;
        trs(chalk.bold.yellow(message + " ") + chalk.bold.yellow(P[x]));
        x %= P.length - 1;
      }, 50);
    };
    let stop = ((_m?: "") => {
      readline.cursorTo(_wr, 0);
      readline.clearLine(_wr, 0);
      if (finalMessage.length > 0) {
        this.write("\r" + chalk.bold.yellow(_m), "clear", this.subject);
      }
      clearInterval(timer);
    }).bind(this);

    let trs = ((m: string) => {
      let indention = this.fill(process.stdout.columns - this.cols);
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
    Writer.log(message, subject);
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
    Writer.log(draw(parsedStr), subject);
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
  format(a?: string, b?: string): void;
  group(a: string): void;
  endGroup(a: string): void;
  endGroups(): void;
  style(a: string): Writable;
  loading(a: string, b?: any): any;
}
