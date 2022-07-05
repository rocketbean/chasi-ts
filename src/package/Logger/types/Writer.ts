import chalk from "chalk";
import logStyles from "../styles/style.js";
import Group from "../Group.js";
import util from "util";

export default abstract class Writer {
  log: Function = console.log;

  logType: { [key: string]: Function } = logStyles;

  spacer: string = " ";
  groups: Group[] = [];

  displayAs: Function = this.logType.clear;

  abstract format(message: string, b?: string, c?: string | number): void;

  protected fill(space: number, spacer: string = " "): string {
    return this.spacer.repeat(space);
  }

  style(key: string): Writable {
    this.displayAs = this.logType[key];
    return this;
  }

  loading(message: string = "") {
    let timer;
    let start = () => {
      var P = ["\\", "|", "/", "-", "*"];
      var x = 0;
      timer = setInterval(function () {
        x++;
        process.stdout.write(
          "\r" +
            chalk.bold.yellow(message + " ") +
            chalk.bold.yellow(P[x]) +
            " ",
        );
        x %= P.length - 1;
      }, 50);
    };
    let stop = () => {
      clearInterval(timer);
      process.stdout.cursorTo(0);
    };
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
    this.groups.unshift(new Group(label));
  }

  endGroup(label: string = " ") {
    this.groups = this.groups.filter((group) => {
      if (group.name == label) {
        group.end();
      }
      return group.name != label;
    });
  }

  endGroups() {
    this.groups = this.groups.filter((group) => {
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
}
