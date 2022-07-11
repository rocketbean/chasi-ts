import Writer, { Writable } from "./Writer.js";
export default class EndTrace extends Writer implements Writable {
  public spacer: string = "-";
  format(message: string) {
    let width: number = this.cols / 1.6;
    return message + this.fill(width - message.length);
  }
}
