import {
  ModuleInterface,
  DatabaseConfig,
  DBProperty,
  Constructuble,
} from "../Interfaces.js";
import Driver, { DBDriverInterface } from "./drivers/drivers.js";
import MongoDBDriver from "./drivers/mongodb.js";

export default class Database implements ModuleInterface {
  $databases: { [key: string]: DBDriverInterface } = {};

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

  constructor(public config: DatabaseConfig) {
    this.config = config;
  }

  async collect(): Promise<void> {
    await Promise.all(
      Object.keys(this.config.connections).map(async (con: string) => {
        let connection = this.config.connections[con] as DBProperty;
        let driver = this.$drivers[connection.driver];
        this.$databases[con] = new driver(connection, con);
        if (con == this.config.default) this.$databases[con].isDefaultDB = true;
      }),
    );
  }

  async connectDbs(): Promise<void> {
    for (let db in this.$databases) {
      let loader = Logger.writer("Left").loading(
        `Initialize connection [${db}]`,
        "done",
      );
      loader.start();
      this.$databases[db].connection = await this.$databases[db].connect(
        loader.stop,
      );
    }
  }

  async log(): Promise<void> {
    await Promise.all(
      Object.keys(this.$databases).map(async (db: string) => {}),
    );
  }

  static async init(config) {
    Logger.writers["Left"].group("Database");
    let db = new Database(config as DatabaseConfig);
    await db.collect();
    await db.connectDbs();
    await db.log();
    Logger.writers["Left"].endGroup("Database");
    return db;
  }
}
