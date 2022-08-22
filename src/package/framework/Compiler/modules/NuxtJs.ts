import path from "path";
import chalk from "chalk";
import defaults from "./NuxtJs/defaults.js";
import Base from "../../../Base.js";
import { Iobject } from "../../Interfaces.js";
import { Nuxt, build, loadNuxt } from "nuxt";
/** NuxtJS
 * Compiler Engine Driver
 */
export default class NuxtJs {
  public instance;
  public log: Iobject = {
    left: Logger.writer("Left", "routeRegistry"),
    full: Logger.writer("Full", "routeRegistry"),
    trace: Logger.writer("StartTrace", "routeRegistry"),
    center: Logger.writer("FullCustom", "routeRegistry"),
  };
  public name: string = "NuxtJs";
  public state;
  public conFilePath;
  public onDev;
  constructor(public config) {
    this.onDev = process.env.NODE_ENV !== "production";
    this.state = config.engines.NuxtJs;
  }

  /* * * [setup]
   * Initial instance setup
   * running before [APP]
   */
  async setup() {
    this.conFilePath = path.join(this.config.outDir, "nuxt.config.js");
    let conf = await Base._fetchFile(this.conFilePath);
    if (this.state.useProdEnv) this.instance = await loadNuxt("start");
    else this.instance = new Nuxt(conf);
    if (this.onDev && !this.state.useProdEnv) {
      await build(this.instance);
    }
    return this.instance;
  }

  /* * * * [logRoutes]
   * Log Routes added to the registry
   */
  async logRoutes() {
    this.log.trace.spaceLength = 1.9;
    let prefix = {
      text: `[..${this.instance.options.router.base}]`.toUpperCase(),
      style: chalk.bgHex("484276").bold.white,
    };
    this.log.center.drawAs(
      this.log.center.customFormat(prefix, `[${this.name}]::EngineClass`) +
        "\n",
      chalk.bgGreenBright.black,
      false,
    );
    let base = this.instance.options.router.base;
    this.instance.options.router.routes.forEach((item) => {
      let routePath = (base + item.path).replace(/\/\//, "/");
      let routeName = `♦╡[${item.chunkName}]`;
      this.log.left.drawAs(routeName, chalk.yellow);
      this.log.trace.drawAs(
        this.log.trace.customFormat(routePath + "\n", routeName.length),
        chalk.green,
        false,
      );
    });
  }

  static async setup() {
    return {
      ...defaults,
    };
  }
}
