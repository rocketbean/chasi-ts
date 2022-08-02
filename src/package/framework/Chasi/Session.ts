import Base from "../../Base.js";
import Cluster from "cluster";
import SessionWriter from "./writers/FileWriter.js";
import ServiceCluster from "./ServiceCluster.js";
import horizon from "../../statics/horizon/config.js";
import { v4 as uuidv4 } from "uuid";
import { Handler } from "../../Handler.js";
import { Iobject } from "./../Interfaces.js";
import Writer from "../../Logger/types/Writer.js";
export default class Session {
  public id = uuidv4();
  public writer: SessionWriter;
  public nodeVer: number;
  private $app: Handler;
  static nodeVer = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
  constructor(public config: Iobject) {
    this.config = config;
  }

  attachApp($app: Handler) {
    this.$app = $app;
  }

  /**
   * checking [node version]
   * to return [isMaster]
   * || [isPrimary] property
   *
   **/
  static checkMainThread(): Function | boolean {
    if (Session.nodeVer < 16) return Cluster.isMaster;
    else return Cluster.isPrimary;
  }

  static async createHandler(session: Session, config: Iobject) {
    let $app = await Handler.init(config);
    session.attachApp($app);
    return $app;
  }

  static async initialize(config: Iobject) {
    config = <Iobject>Base.mergeObjects(horizon, config);
    let session = new Session(config);
    let cluster = new ServiceCluster(session);
    cluster.createStorage();
    Writer.log = cluster.storage.write.bind(cluster.storage);
    if (config.server.serviceCluster.enabled) {
      if (Session.checkMainThread()) {
        await cluster.createCluster();
      } else {
        process.on("message", (msg) => {
          console.log(msg, "message rec");
        });
        return await Session.createHandler(session, config);
      }
    } else {
      return await Session.createHandler(session, config);
    }
  }
}
