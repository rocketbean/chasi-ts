import Base from "../../Base.js";
import { DatabaseDrivers, PrismaOptions } from "Chasi/Database";
import { Iobject } from "../Interfaces.js";
import path from "path";

export type PrismaSchemaEntry = {
  client: string;
  schema?: string;
  url: string;
};

export const ModelCollection: Iobject = {};
export default class Models extends Base {
  static $databases: DatabaseDrivers;
  static collection: Iobject = ModelCollection;
  static config: Iobject;
  static prismaSchemas: Record<string, PrismaSchemaEntry> = {};

  /**
   * Collects Prisma schema/client paths from config/database.ts connections.
   */
  static collectPrismaSchemas(
    connections: Record<string, { driver: string; url: string; options?: unknown }> =
      Models.config?.connections
  ): Record<string, PrismaSchemaEntry> {
    const schemas: Record<string, PrismaSchemaEntry> = {};

    if (!connections) {
      Models.prismaSchemas = schemas;
      return schemas;
    }

    Object.entries(connections).forEach(([name, conn]) => {
      if (conn.driver !== "prisma") return;
      const opts = conn.options as PrismaOptions<unknown>;
      schemas[name] = {
        client: opts.client,
        schema: opts.schema,
        url: conn.url,
      };
    });

    Models.prismaSchemas = schemas;
    return schemas;
  }

  static async collect() {
    let dirs = Models.config.modelsDir;
    //mongodb model collection
    for (let dir in dirs) {
      let base = path.join(___location, dirs[dir]);
      (await Models._fsFetchDir<any>(dirs[dir])).map((content) => {
        Models.collection[content?.modelName?.toLowerCase()] = content;
      });
    }
    Object.keys(this.$databases).map((db: string) => {
      let _d = this.$databases[db];
      Models.collection[db] = {};

      if (_d.driverName === "mongodb") {
        Models.collection[_d.name] = _d.connection.models
      }

      if (_d.driverName === "prisma") {
        Object.keys(_d["models"]).map((model) => {
          Models.collection[db][model] = _d["models"][model];
        });
      }

      if (_d.driverName === "drizzle") {
        // _db holds the live Drizzle query client; remaining keys are table definitions
        Object.keys(_d["models"]).map((key) => {
          Models.collection[db][key] = _d["models"][key];
        });
      }
    });
  }

  static async init(dbs: DatabaseDrivers, config: Iobject) {
    try {
      Models.$databases = dbs;
      Models.config = config;
      Models.collectPrismaSchemas(config.connections);
      await Models.collect();
      return Models;
    } catch (e) {
      Logger.log(e);
    }
  }
}
