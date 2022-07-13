import chalk from "chalk";
import logStyles from "../styles/style.js";
import Group from "../Group.js";
import util from "util";

export default abstract class Writer {
  log: Function = console.log;

  logType: { [key: string]: Function } = logStyles;
  static groups: Group[] = [];
  spacer: string = " ";
  groups: Group[] = [];
  displayAs: Function = this.logType.clear;

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
      process.stdout.cursorTo(0);
      process.stdout.clearLine(0);
      if (finalMessage.length > 0) {
        trs(chalk.bold.yellow(_m));
      }
      clearInterval(timer);
    }).bind(this);

    let trs = ((m: string) => {
      let indention = this.fill(process.stdout.columns - this.cols);
      _wr.write("\r" + indention + m);
    }).bind(this);
    return { start, stop };
  }

  write(message: any, display: string = "system"): void {
    if (typeof message == "object") {
      this.log(
        util.inspect(message, {
          showHidden: false,
          depth: null,
          colors: true,
        }),
      );
    } else this.log(this.logType[display](this.format(message)));
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
  write(a?: string | object, b?: string): void;
  format(a?: string, b?: string): void;
  group(a: string): void;
  endGroup(a: string): void;
  endGroups(): void;
  style(a: string): Writable;
  loading(a: string, b?: any): any;
}
