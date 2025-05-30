import DB, {
  DatabaseConfig,
  DatabaseDrivers,
  DBProperty,
} from "Chasi/Database";
import { ModuleInterface, Constructuble } from "../Interfaces.js";
import Models from "./Models.js";
import chalk from "chalk";
import Driver from "./drivers/drivers.js";
import MongoDBDriver from "./drivers/mongodb.js";
import PrismaDriver from "./drivers/prisma.js";
export default class Database implements ModuleInterface {
  $databases: DatabaseDrivers = {};

  $drivers: { [key: string]: Constructuble<Driver> } = {
    mongodb: MongoDBDriver as Constructuble<Driver>,
    prisma: PrismaDriver as Constructuble<Driver>,
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
      "done2"
    ),
  };

  logLeft: any;

  constructor(public config: DatabaseConfig) {
    this.config = config;
    this.logLeft = Logger.writers.Left;
    this.logLeft.subject = "database";
  }

  async collect<U extends { [key: string]: Record<string, DBProperty<U>> }>(
    connections: U
  ): Promise<void> {
    let keys = <Array<keyof U & string>>Object.keys(connections);
    await Promise.all(
      keys.map(async (con: keyof U & string) => {
        let _c = connections[con];
        let connection: DBProperty<DB.drivers, typeof _c> =
          this.config.connections[con];
        connection.hideLogConnectionStrings =
          this.config.hideLogConnectionStrings;
        let driver = this.$drivers[connection.driver];
        this.$databases[con] = new driver(connection, con);
        if (con == this.config.default) this.$databases[con].isDefaultDB = true;
      })
    );
  }

  async connectDbs(): Promise<void> {
    for (let db in this.$databases) {
      let loader = this.logLeft.loading(
        `Initialize connection [${db}]`,
        "done"
      );
      loader.start();
      try {
        this.$databases[db].connection = await this.$databases[db].connect(
          loader.stop
        );
      } catch (e) {
        let message = `Error connecting to [${db}], please check connection settings`;
        if (this.config.bootWithDB) {
          message += chalk.red(
            `\n├─○ config.database[bootWithDB] is enabled, the application will terminate process...`
          );
        }
        loader.stop(
          `  ╕[${chalk.red("•")}]${db.toUpperCase()}      - ${message} \n`
        );
        if (this.config.bootWithDB) throw e;
      }
    }

    this.$databases["_"] = this.$databases[this.config.default];
  }

  async log(): Promise<void> {
    await Promise.all(
      Object.keys(this.$databases).map(async (db: string) => {})
    );
  }

  static async init(config) {
    let db = new Database(config);
    await db.collect(<{ [key: string]: any }>db.config.connections);
    await db.connectDbs();
    await db.log();
    await Models.init(db.$databases, config);
    return db;
  }
}
