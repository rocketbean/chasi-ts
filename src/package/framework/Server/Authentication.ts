import { Iobject, AuthDriver } from "../Interfaces.js";
import Base from "../../Base.js";
export default class Authentication {
  static $drivers: { [key: string]: AuthDriver } = {};

  constructor(public config: Iobject) {
    this.config = config;
  }

  async createDrivers(): Promise<void> {
    await Promise.all(
      Object.keys(this.config.drivers).map(async (d: string) => {
        let driverConfig = this.config.drivers[d];
        if (!driverConfig.handler)
          driverConfig.handler = this.config.defaultJWTDriverPAth;
        const DriverClass = await Base._fetchFile(driverConfig.handler) as new (config: Iobject) => AuthDriver;
        Authentication.$drivers[d] = new DriverClass(driverConfig);
      }),
    );
  }

  async init() {
    await this.createDrivers();
  }
}
