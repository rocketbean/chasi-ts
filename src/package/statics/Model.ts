import mongoose, { Schema } from "mongoose";
import Models from "../framework/Database/Models.js";

export default class Model extends Models {
  /**
   * Registers a Mongoose schema against a named MongoDB connection.
   * Returns a Mongoose Model bound to that connection's live socket.
   *
   * @param name       Schema / collection name
   * @param schema     Mongoose Schema object
   * @param connection Connection key from config/database.ts (default: "_")
   */
  static connect<T = {}, K = {}>(
    name: string,
    schema: Schema<T, K>,
    connection: string = "_"
  ): mongoose.Model<T, K> {
    try {
      if (Model.$databases[connection].config.driver === "mongodb") {
        if (Model.$databases[connection]?.connection) {
          return Model.$databases[connection]?.connection?.model(
            name,
            schema
          ) as mongoose.Model<T, K>;
        }
      }
    } catch (e) {
      Logger.log(`Model[${name}] unable to connect to Con[${connection}]`);
      Logger.log(e);
    }
  }

  /**
   * Returns the live Drizzle query client for a named connection.
   * Use this inside a model or controller to run Drizzle queries:
   *
   *   const db = Model.drizzle("myPgConn");
   *   const rows = await db.select().from(users);
   *
   * Schema tables are also accessible via this.models.connectionName.tableName.
   *
   * @param connection Connection key from config/database.ts (default: "_")
   */
  static drizzle(connection: string = "_"): any {
    const driver = Model.$databases[connection];
    if (!driver) {
      throw new Error(`[Drizzle] No connection found for "${connection}".`);
    }
    if (driver.driverName !== "drizzle") {
      throw new Error(
        `[Drizzle] Connection "${connection}" uses driver "${driver.driverName}", not "drizzle".`
      );
    }
    return driver.connection;
  }
}
