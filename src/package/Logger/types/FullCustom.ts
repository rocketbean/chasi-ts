import { exit } from "process";
import { Iobject } from "../../framework/Interfaces.js";
import Writer, { Writable } from "./Writer.js";
import chalk from "chalk";
export default class FullCustom extends Writer implements Writable {
  format(message: string) {
    let width: number = this.cols / 2;
    let mw: number = message.length / 2 + this.groups.length / 2;
    message = this.fill(width - mw) + message + this.fill(width - mw);
    if (message.length < this.cols) {
      message += this.fill(this.cols - message.length);
    }
    return "\n" + message;
  }

  customFormat(
    prefix: Iobject,
    message: string,
    suffix: Iobject = { text: "", style: chalk.green },
  ) {
    let prefixLength: number = prefix?.text.length || 0;
    let suffixLength: number = suffix?.text.length || 0;
    let width: number = this.cols / 2;
    let pmw: number = message.length / 2 + prefixLength + 2;
    let smw: number = message.length / 2 + suffixLength + 2;
    let pSpace = chalk.inverse(" ");
    let sSpace = suffixLength > 0 ? chalk.inverse(" ") : "";
    message =
      prefix.style(prefix.text) +
      pSpace +
      this.fill(width - pmw) +
      message +
      this.fill(width - smw) +
      sSpace +
      suffix.style(suffix.text);
    if (message.length < this.cols) {
      message += this.fill(this.cols - message.length);
    }
    return `\n` + message;
  }
}
