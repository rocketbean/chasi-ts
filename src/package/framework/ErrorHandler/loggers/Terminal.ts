import { ExceptionLoggerInterface } from "../../Interfaces.js";
import * as writers from "../../../Logger/types/writers.js";
import chalk from "chalk";
export default class TerminalLogger implements ExceptionLoggerInterface {
  public full = new writers.Full();
  async write(message: any, stack?: any) {
    process.stdout.write(
      chalk.dim.bold.bgRgb(250, 204, 204).rgb(0, 0, 24)(
        `  ○ Exception${message} \n`,
      ),
    );
    if (stack) {
      process.stdout.write(chalk.bold.yellow(stack) + "\n");
    }
  }
}
