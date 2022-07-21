import { Iobject, RouterConfigInterface } from "../Interfaces.js";
import Collector from "./Collector.js";
import Controller from "./Controller.js";
import Base from "../../Base.js";
export default class Router extends Collector {
  static Controllers: { [key: string]: any } = {};
  static Middlewares: { [key: string]: any } = {};
  static defaultControllerDir: string = "";
  $log: { [key: string]: any } = {
    center: Logger.writer("Center"),
    left: Logger.writer("Left"),
    right: Logger.writer("Right"),
    endTrace: Logger.writer("EndTrace"),
    startTrace: Logger.writer("StartTrace"),
    RouterList: Logger.writer("RouterList"),
  };

  constructor(public property: RouterConfigInterface) {
    super(property);
    this.property = property;
  }

  static async registerController(dir: string, instance: Controller) {
    dir = dir.replace(/\\/g, "/").replace(/\/\//g, "/");
    Router.Controllers[dir] = {
      constructor: instance.constructor.name,
      instance,
    };
  }

  static async loadMiddlewares(mw: Iobject) {
    await Promise.all(
      Object.keys(mw).map(async (_p) => {
        Router.Middlewares[_p] = await Base._fetchFile(mw[_p]);
      }),
    );
  }

  async set() {
    return await this.init();
  }

  async log() {
    this.$log.RouterList.displayRouter(this);
  }
}
