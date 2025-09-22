import DB, { DBProperty, PrismaOptions } from "Chasi/Database";
import Driver from "./drivers.js";
import chalk from "chalk";
import Base from "../../../Base.js";
export default class PrismaDriver<U> extends Driver implements DB.DBDriverInterface {
  public driverName = <DB.drivers>"prisma";
  public isDefaultDB: boolean = false;
  public protocol: string = "";
  public driver: any;
  public logger;
  public models: Record<string, any> = {};
  public connection: { [key: string]: any } = {};
  constructor(public config: DBProperty<"prisma", U>, public name: string) {
    super(config);
    this.name = name;
    this.logger = Logger.writers.Left;
    this.setup();
  }

  setup() {
    this.hasOptions = true;
    this.$property.url = this.config.url;
    this.$property.options = this.config.options;
    this.getDriver(this.config.options["client"]).then(() => this.setModels());
    // this.setModels();
  }

  async getDriver(pathstring: string) {
    try {
      let globals = this.config.options?.globals || {};
      let _c = await Base._fetchFile(pathstring + "/index.js", false);
      this.driver = new _c.PrismaClient({ ...globals });
    } catch (e) {
      Logger.log(pathstring);
      Logger.log(e);
    }
  }

  setModels() {
    let _m = this.driver?._runtimeDataModel?.models;
    Object.keys(_m).map((m: string) => {
      let _model = this.driver[m];
      this.models[m.toLowerCase()] = _model;
    });
  }

  hideStrings(conString: string) {
    let matched = conString.match(/\/\/(.*?)\//g)[0];
    let starlength = matched.length;
    let stars: string | string[] = "*".repeat(starlength / 2);
    let _at = matched.indexOf("@");
    stars = stars.split("");
    if (_at > 0) {
      stars[_at / 2] = matched[_at / 2];
      stars[_at / 2 - 1] = matched[_at / 2 - 1];
      stars[_at / 2 + 1] = matched[_at / 2 + 1];
      stars[0] = matched[0];
      stars[starlength / 2 - 1] = matched[starlength / 2 - 1];
    }
    return stars.join("");
  }

  async connect(stop: Function) {
    await this.getDriver(this.config.options["client"]);
    try {
      stop(
        `  ╡[${this.states[1]("•")}]${
          this.isDefaultDB
            ? chalk.greenBright.underline(this.name.toUpperCase())
            : this.name.toUpperCase()
        }`
      );
      if (this.config.hideLogConnectionStrings) {
        let str = this.hideStrings(this.$property.url);
        this.logger.write(
          ` - ${this.$property.url.replace(/\/\/(.*?)\//g, str)}\n`
        );
      } else {
        this.logger.write(` - ${this.$property.url}\n`);
      }
      return this.driver;
    } catch (e) {
      throw e;
    }
  }
}
