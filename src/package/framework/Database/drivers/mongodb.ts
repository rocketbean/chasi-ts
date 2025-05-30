import DB, { DBProperty, DBDriverInterface } from "Chasi/Database";
import Driver from "./drivers.js";
import { Iobject } from "../../Interfaces.js";
import mongoose from "mongoose";
import chalk from "chalk";
export default class MongoDBDriver extends Driver implements DBDriverInterface {
  public driverName = <DB.drivers>"mongodb";
  public $property: Iobject = {};
  public protocol = "mongodb://";
  public connection: any;
  public hasOptions = false;
  public isDefaultDB = false;
  public logger;

  public states: any[] = [
    chalk.redBright,
    chalk.greenBright,
    chalk.yellowBright,
    chalk.whiteBright,
  ];

  constructor(public config: DBProperty<"mongodb">, public name: string) {
    super(config);
    this.name = name;
    this.config = config;
    this.logger = Logger.writers.Left;
    this.logger.subject = "database";
    this.setup();
  }

  setup() {
    this.$property.url = this.config.url + this.config.db;
    if (this.config.params) this.$property.url += this.config.params;
    if (this.config.options) {
      this.hasOptions = true;
      this.$property.options = this.config.options;
    }
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
    let params: [string, object?] = [this.$property.url];
    if (this.hasOptions) params.push(this.$property.options);
    return await mongoose
      .createConnection(...params)
      .asPromise()
      .then((con) => {
        stop(
          `  ╡[${this.states[con.readyState]("•")}]${
            this.isDefaultDB
              ? chalk.greenBright.underline(this.name.toUpperCase())
              : this.name.toUpperCase()
          } `
        );
        if (this.config.hideLogConnectionStrings) {
          let str = this.hideStrings(this.$property.url);
          this.logger.write(
            ` - ${this.$property.url.replace(/\/\/(.*?)\//g, str)}\n`
          );
        } else {
          this.logger.write(` - ${this.$property.url}\n`);
        }

        return con;
      })
      .catch((e) => {
        throw e;
      });
  }
}
