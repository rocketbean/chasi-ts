import { RouterConfigInterface } from "../Interfaces.js";
import Collector from "./Collector.js";
import Controller from "./Controller.js";

export default class Router extends Collector {
  static Controllers: { [key: string]: any } = {};
  static defaultControllerDir: string = "";
  $log: { [key: string]: any } = {
    center: Logger.writer("Center"),
    left: Logger.writer("Left"),
    right: Logger.writer("Right"),
    endTrace: Logger.writer("EndTrace"),
    startTrace: Logger.writer("StartTrace"),
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

  async set() {
    return await this.init();
  }

  async log() {
    this.$log.left.group(this.property.name);
    this.$registry.routes.forEach((route) => {
      this.$log.startTrace.write(
        `[${route.property.method.toUpperCase()}]${route.path}`,
      );
    });
    this.$log.left.endGroup(this.property.name);
  }
}
