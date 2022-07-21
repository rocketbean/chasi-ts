import Writer, { Writable } from "./Writer.js";
export default class LeftFull extends Writer implements Writable {
  public spacer: string = " ";
  format(message: string) {
    let width: number = this.cols;
    let mw: number = message.length;
    return message + this.fill(width - mw);
  }
}
