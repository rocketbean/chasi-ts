import {
  ModuleInterface,
  DatabaseConfig,
  DBProperty,
  Constructuble,
  DatabaseDrivers,
} from "../Interfaces.js";
import Models from "./Models.js";
import chalk from "chalk";
import Driver, { DBDriverInterface } from "./drivers/drivers.js";
import MongoDBDriver from "./drivers/mongodb.js";
import { exit } from "process";

export default class Database implements ModuleInterface {
  $databases: DatabaseDrivers = {};

  $drivers: { [key: string]: Constructuble<Driver> } = {
    mongodb: MongoDBDriver as Constructuble<Driver>,
  };

  static $log: { [key: string]: any } = {
    center: Logger.writer("Center"),
    left: Logger.writer("Left"),
    right: Logger.writer("Right"),
    endTrace: Logger.writer("EndTrace"),
    startTrace: Logger.writer("StartTrace"),
    RouterList: Logger.writer("RouterList"),
    loader: Logger.writers["Left"].loading(
      "DB Connection Initializing",
      "done2",
    ),
  };

  logLeft: any;

  constructor(public config: DatabaseConfig) {
    this.config = config;
    this.logLeft = Logger.writers.Left;
    this.logLeft.subject = "database";
  }

  async collect(): Promise<void> {
    await Promise.all(
      Object.keys(this.config.connections).map(async (con: string) => {
        let connection = this.config.connections[con] as DBProperty;
        connection.hideLogConnectionStrings =
          this.config.hideLogConnectionStrings;
        let driver = this.$drivers[connection.driver];
        this.$databases[con] = new driver(connection, con);
        if (con == this.config.default) this.$databases[con].isDefaultDB = true;
      }),
    );
  }

  /***
   * fake loading time for [testing purposes]
   */
  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async connectDbs(): Promise<void> {
    for (let db in this.$databases) {
      let loader = this.logLeft.loading(
        `Initialize connection [${db}]`,
        "done",
      );
      loader.start();
      try {
        this.$databases[db].connection = await this.$databases[db].connect(
          loader.stop,
        );
      } catch (e) {
        let message = `Error connecting to [${db}], please check connection settings`;
        if (this.config.bootWithDB) {
          message += chalk.red(
            `\n├─○ config.database[bootWithDB] is enabled, the application will terminate process...`,
          );
        }
        loader.stop(
          `  ╕[${chalk.red("•")}]${db.toUpperCase()}      - ${message} \n`,
        );
        if (this.config.bootWithDB) throw e;
      }
    }
    this.$databases["_"] = this.$databases[this.config.default];
  }

  async log(): Promise<void> {
    await Promise.all(
      Object.keys(this.$databases).map(async (db: string) => {}),
    );
  }

  static async init(config) {
    let db = new Database(config as DatabaseConfig);
    await db.collect();
    await db.connectDbs();
    await db.log();
    await Models.init(db.$databases, config);
    return db;
  }
}
