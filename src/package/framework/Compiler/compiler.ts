import Writer from "../../Logger/types/Writer.js";
import { Iobject } from "../Interfaces.js";

export default class CompilerEngine {
  public log: Writer = Logger.writer("Left");
  constructor(public config: Iobject) {
    console.log(config);
  }

  static async init(config: Iobject) {
    let engine = new CompilerEngine(config);
    engine.log.write(config);
    return engine;
  }
}
