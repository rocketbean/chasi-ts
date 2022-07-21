import Writer, { Writable } from "./Writer.js";
export default class FullCustom extends Writer implements Writable {
  format(message: string | object) {}
}
