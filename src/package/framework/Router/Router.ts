import { Iobject } from "../Interfaces.js";
import Collector from "./Collector.js";
import Controller from "./Controller.js";
import Base from "../../Base.js";
import { RouterConfigInterface } from "Chasi/Router";
import { Express } from "express";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { RouterSpec } from "Chasi/Router";
export default class Router extends Collector {
  /**
   * static Controllers
   * instance Storage
   */
  static Controllers: { [key: string]: any } = {};

  /**
   *
   * static Controllers
   * FunctionStorage
   */
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

  static defaultProps: Iobject = {
    data: () => {
      return {};
    },
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
      })
    );
  }

  async set() {
    return await this.init();
  }

  async log() {
    if (this.property.displayLog > 0) this.$log.RouterList.displayRouter(this);
  }

  getSpecPaths() {
    let paths = {};
    this.$registry.routes.forEach((route) => {
      if (!route.property?.options?.spec) return;
      let def = route.definition;
      let strpath = route.path
        .split("/")
        .map((str) => {
          if (str.includes(":")) return `{${str.replace(":", "")}}`;
          else return str;
        })
        .join("/");
      route.docPath = strpath;
      if (!paths[strpath]) paths[strpath] = def;
      else {
        paths[strpath] = Object.assign(paths[strpath], def);
      }
    });

    return paths;
  }

  defineSpec(): swaggerJSDoc.Options | never {
    let spec = this.property.spec.spec;
    spec.definition.info.title = `[${this.property.name}]`.concat(
      spec.definition.info.title
    );
    return {
      ...spec,
    };
  }

  async serveDocSpec($app: Express): Promise<void> {
    if (this.property.spec?.config?.enabled) {
      let url = this.property.spec.config?.url
        ? this.property.spec.config?.url
        : this.property.prefix;

      if (this.property?.prefix && this.property.spec.config.url) {
        url = path.join(
          "/",
          this.property.prefix,
          this.property.spec.config.url
        );
      }

      let spec = swaggerJSDoc(this.defineSpec());
      spec["paths"] = __deepMerge(spec["paths"], this.getSpecPaths());

      if (this.property.spec.config?.jsonFile) {
        await Base._writeOrUpdateFile(
          this.property.spec.config.jsonFile,
          JSON.stringify(spec, null, 2)
        );
      }
      $app.use(url, swaggerUi.serve, swaggerUi.setup(spec));
    }
  }
}
