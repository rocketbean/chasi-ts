import { Iobject, AuthDriver } from "../Interfaces.js";
import Base from "../../Base.js";
export default class Authentication {
  static $drivers: { [key: string]: AuthDriver } = {};

  constructor(public config: Iobject) {
    this.config = config;
  }

  async createDrivers() {
    await Promise.all(
      Object.keys(this.config.drivers).map(async (d: string) => {
        let driverConfig = this.config.drivers[d];
        if (!driverConfig.handler)
          driverConfig.handler = this.config.defaultJWTDriverPAth;
        Authentication.$drivers[d] = new (await Base._fetchFile(
          driverConfig.handler,
        ))(driverConfig);
      }),
    );
  }

  async init() {
    await this.createDrivers();
  }
}
