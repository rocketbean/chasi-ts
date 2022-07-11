import Writer, { Writable } from "./Writer.js";
export default class Right extends Writer implements Writable {
  format(message: string) {
    let width: number = this.cols;
    let mw: number = message.length;
    if (this.groups.length > 0) width -= this.groups.length;
    return this.fill(width - mw) + message;
  }
}
