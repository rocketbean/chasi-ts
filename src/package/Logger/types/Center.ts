import Writer, { Writable } from "./Writer.js";
export default class Center extends Writer implements Writable {
  format(message: string) {
    let width: number = this.cols / 2;
    let mw: number = message.length / 2;
    message = this.fill(width - mw) + message + this.fill(width - mw);
    if (message.length < this.cols) {
      message += this.fill(this.cols - message.length);
    }
    return message;
  }
}
