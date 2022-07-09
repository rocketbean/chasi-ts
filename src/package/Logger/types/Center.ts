import Writer, { Writable } from "./Writer.js";
export default class Center extends Writer implements Writable {
  format(message: string) {
    let width: number = process.stdout.columns / 2;
    let mw: number = message.length / 2;
    message = this.fill(width - mw) + message + this.fill(width - mw);
    if (message.length < process.stdout.columns) {
      message += this.fill(process.stdout.columns - message.length);
    }
    return message;
  }
}
