import Writer, { Writable } from "./Writer.js";
export default class StartTrace extends Writer implements Writable {
  public spacer: string = "-";
  format(message: string) {
    let width: number = this.cols / 1.5;
    return this.fill(width - message.length) + message;
  }
}
