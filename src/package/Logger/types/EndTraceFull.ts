import Writer, { Writable } from "./Writer.js";
import tty from "tty";
export default class EndTraceFull extends Writer implements Writable {
  public spacer: string = "-";
  format(message: string) {
    message = `${message} `;
    let width: number = <number>this.cols;
    message += this.fill(width - message.length - 1);
    message += "╣\n";
    return message;
  }
}
