import { v4 as uuidv4 } from "uuid";
import { Handler } from "../../Handler.js";
import { Iobject } from "./../Interfaces.js";
import util from "util";
import SessionWriter from "./writers/FileWriter.js";

export default class Session {
  public id = uuidv4();
  public writer: SessionWriter;
  constructor(private app: Handler, public config: Iobject) {
    this.app = app;
    this.config = config;
    this.writer = new SessionWriter(this.config.container.session.cacheFile);
  }

  async backup() {
    try {
      if (this.config.container.session.cache) {
        await this.writer.write(this.raw());
        console.log(
          `Session[${this.id}]:: session stored [${this.config.container.session.cacheFile}]`,
        );
      }
    } catch (e) {
      console.log(e, "failed to store session");
    }
  }

  raw() {
    return util.inspect(this.toObject(), {
      showHidden: false,
      depth: null,
      colors: true,
    });
  }

  toObject() {
    return {
      [this.id]: {
        app: this.app,
        LoadedConfig: this.config,
      },
    };
  }
}
