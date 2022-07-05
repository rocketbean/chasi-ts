import Writer, { Writable } from "./Writer.js";
export default class Right extends Writer implements Writable {
  format(message: string) {
    let width: number = process.stdout.columns;
    let mw: number = message.length;
    return this.fill(width - mw) + message;
  }
}
