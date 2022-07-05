import chalk from "chalk";
import Logger from "./index.js";
import { Writable } from "./types/Writer.js";

export default class Group {
  name: string;
  logger: Logger = Logger.init();
  writer: Writable;

  constructor(name: string) {
    this.name = name;
    console.group(
      chalk.grey.bgGreen.bold.underline(` | ${this.name.toUpperCase()} `),
    );
  }

  end() {
    console.groupEnd();
    console.log(
      chalk.greenBright.bgMagentaBright.bold.underline(
        ` | ${this.name.toUpperCase()} `,
      ),
    );
  }
}
