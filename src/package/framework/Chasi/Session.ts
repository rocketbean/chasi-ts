import Cluster from "cluster";
import Base from "../../Base.js";
import CompilerEngine from "../Compiler/compiler.js";
import SessionWriter from "./writers/FileWriter.js";
import ServiceCluster from "./ServiceCluster.js";
import horizon from "../../statics/horizon/config.js";
import SessionStorage from "./Storage.js";
import Writer from "../../Logger/types/Writer.js";
import { v4 as uuidv4 } from "uuid";
import { Handler } from "../../Handler.js";
import { Iobject } from "./../Interfaces.js";
import { exit } from "process";
import PipeHandler from "./PipeHandler.js";

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
   **/
  static checkMainThread(): Function | boolean {
    if (Session.nodeVer < 16) return Cluster.isMaster;
    else return Cluster.isPrimary;
  }

  static async createHandler(
    session: Session,
    config: Iobject,
    pipe?: PipeHandler,
  ) {
    let $app = await Handler.init(config, pipe);
    session.attachApp($app);
    return $app;
  }

  static async validates(config) {
    if (config.compiler.enabled) {
      Writer.log = process.stdout.write;
      await CompilerEngine.runValidations(config);
    }
    return;
  }

  static async initialize(config: Iobject) {
    config = <Iobject>Base.mergeObjects(horizon, config);
    if (!config.server.serviceCluster.enabled) await Session.validates(config);
    let session = new Session(config);
    let cluster = new ServiceCluster(session);
    await cluster.createStorage();
    Writer.log = cluster.storage.write.bind(cluster.storage);
    if (config.server.serviceCluster.enabled) {
      if (Session.checkMainThread()) {
        await Session.validates(config);
        await cluster.createCluster();
      } else {
        let pipe = new PipeHandler();
        await cluster.storage.setPipe(pipe);
        return await Session.createHandler(session, config, pipe);
      }
    } else {
      return await Session.createHandler(session, config);
    }
  }
}
