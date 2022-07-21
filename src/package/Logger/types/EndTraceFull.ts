import Writer, { Writable } from "./Writer.js";
export default class EndTraceFull extends Writer implements Writable {
  public spacer: string = "-";
  format(message: string) {
    message = `| ${message} `;
    let width: number = this.cols;
    return message + this.fill(width - message.length) + "\n";
  }
}
