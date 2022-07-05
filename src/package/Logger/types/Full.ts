import Writer, { Writable } from "./Writer.js";
export default class Full extends Writer implements Writable {
  format(message: string) {
    let width: number = process.stdout.columns / 2;
    let mw: number = message.length / 2;
    return this.fill(width - mw) + message + this.fill(width - mw);
  }
}
