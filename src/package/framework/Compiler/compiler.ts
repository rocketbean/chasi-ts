import Writer from "../../Logger/types/Writer.js";
import validations from "./validations/index.js";
import { Iobject } from "../Interfaces.js";
import NuxtDriver from "./modules/NuxtJs.js";
export default class CompilerEngine {
  public log: Writer = Logger.writer("Left");
  public engine: any;
  public driver: any;
  public driverConfig;
  constructor(public config: Iobject) {
    this.driverConfig = config.engines[config.driver];
  }

  async setup() {
    await this.setupEngine();
  }

  async setupEngine() {
    try {
      this.engine = new NuxtDriver(this.config);
      this.driver = await this.engine.setup();
    } catch (e) {
      this.log.write(e, "@CompilerEngineError");
    }
  }

  async logRoutes() {
    return await this.engine.logRoutes();
  }

  static async runValidations(config: Iobject) {
    return await validations(config, Logger.writer("Left"), __devDirname);
  }

  static async init(config: Iobject) {
    let engine = new CompilerEngine(config);
    await engine.setup();
    return engine;
  }
}
