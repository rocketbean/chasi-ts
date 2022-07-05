import Writer, { Writable } from "./Writer.js";
export default class EndTrace extends Writer implements Writable {
  public spacer: string = "-";
  format(message: string) {
    let width: number = process.stdout.columns / 1.5;
    return message + this.fill(width - message.length);
  }
}
