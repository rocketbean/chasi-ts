import chalk from "chalk";
import Logger from "./index.js";
import { Writable } from "./types/Writer.js";

export default class Group {
  name: string;
  logger: Logger = Logger.init();
  writer: Writable;
  /*╡*/
  constructor(name: string) {
    this.name = name;
    console.group(
      chalk.dim.bold.bgRgb(15, 100, 204).rgb(0, 0, 24)(
        ` • ${this.name.toUpperCase()} \n`,
      ),
    );
  }

  end() {
    console.groupEnd();
    console.log();
  }
}
