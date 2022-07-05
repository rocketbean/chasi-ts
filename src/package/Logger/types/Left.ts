import Writer, { Writable } from "./Writer.js";
export default class Left extends Writer implements Writable {
  public spacer: string = "-";
  format(message: string | object) {
    return message;
  }
}
