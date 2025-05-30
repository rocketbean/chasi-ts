import DB, { DBProperty } from "Chasi/Database";
import Driver from "./drivers.js";
import chalk from "chalk";
import Base from "../../../Base.js";
export default class PrismaDriver<U>
  extends Driver
  implements DB.DBDriverInterface
{
  public driverName = <DB.drivers>"prisma";
  public isDefaultDB: boolean = false;
  public protocol: string = "";
  public driver: any;
  public models: Record<string, any> = {};
  public connection: { [key: string]: any } = {};
  constructor(public config: DBProperty<"prisma", U>, public name: string) {
    super(config);
    this.name = name;
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
      let _c = await Base._fetchFile(pathstring + "/index.js", false);
      this.driver = new _c.PrismaClient();
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
      return this.driver;
    } catch (e) {
      throw e;
    }
  }
}
