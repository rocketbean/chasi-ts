import Driver, { DBDriverInterface } from "./drivers.js";
import { DBProperty, Iobject } from "../../Interfaces.js";
import mongoose, { mongo } from "mongoose";
import chalk from "chalk";
export default class MongoDBDriver extends Driver implements DBDriverInterface {
  public $property: Iobject = {};
  public protocol = "mongodb://";
  public connection: any;
  public hasOptions = false;
  public isDefaultDB = false;
  public states: any[] = [
    chalk.redBright,
    chalk.greenBright,
    chalk.yellowBright,
    chalk.whiteBright,
  ];

  constructor(public config: DBProperty, public name: string) {
    super(config);
    this.name = name;
    this.config = config;
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
  //
  async connect(stop: Function) {
    let params: [string, object?] = [this.$property.url];
    if (this.hasOptions) params.push(this.$property.options);
    return await mongoose
      .createConnection(...params)
      .asPromise()
      .then((con) => {
        stop(
          `[${this.states[con.readyState]("•")}]${
            this.isDefaultDB
              ? chalk.greenBright.underline(this.name.toUpperCase())
              : this.name.toUpperCase()
          } `,
        );
        let str = this.hideStrings(this.$property.url);
        console.log("- " + this.$property.url.replace(/\/\/(.*?)\//g, str));
        return con;
      })
      .catch((e) => {
        stop(`[${this.states[1]("•")}]${this.name.toUpperCase()}`);
        let str = this.hideStrings(this.$property.url);
        console.log(
          chalk.redBright(
            "- " + this.$property.url.replace(/\/\/(.*?)\//g, str),
          ),
        );
        return;
      });
  }
}
