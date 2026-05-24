import Writer, { Writable } from "./Writer.js";
export default class Left extends Writer implements Writable {
  public spacer: string = "-";
  format(message: string | object): string {
    return typeof message === "string" ? message : JSON.stringify(message);
  }
}
