import Writer, { Writable } from "./Writer.js";
export default class StartTrace extends Writer implements Writable {
  public spacer: string = "-";
  public spaceLength: number = 1.5;
  format(message: string) {
    let width: number = this.cols / this.spaceLength;
    return this.fill(width - message.length) + message;
  }

  customFormat(message: string, prefixLength: number) {
    let width: number = this.cols / this.spaceLength;
    width -= prefixLength;
    return this.fill(width - message.length) + message;
  }
}
