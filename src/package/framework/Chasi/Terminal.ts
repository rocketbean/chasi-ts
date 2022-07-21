import { Handler } from "../../Handler.js";
import Session from "./Session.js";
import filewrites from "./checks/filewrites.js";
import { Iobject } from "./../Interfaces.js";
export default class Terminal {
  private sessions: { [key: string]: Session } = {};

  private session: Session;

  async set(config: Iobject, app: Handler): Promise<Session> {
    let session = new Session(app, config);
    this.session = session;
    this.sessions[session.id] = session;
    this.beforeSession();
    return this.session;
  }

  async beforeSession() {
    await filewrites(this.session.config.exceptions.LogType.filepath);
    await filewrites(this.session.config.container.session.logs);
    if (this.session.config.container.session.cache) {
      await filewrites(this.session.config.container.session.cacheFile);
    }
  }

  async cacheSession(id: string) {
    let _s = this.sessions[id].backup();
  }

  static async createSession() {
    return new Terminal();
  }
}
