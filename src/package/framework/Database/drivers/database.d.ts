declare module "Chasi/Database" {
  import { Prisma, PrismaClient } from "@prisma/client";

  export type drivers = "prisma" | "mongodb" | "drizzle";

  export interface DBDriverInterface {
    config: DBProperty<drivers, U>;
    connection: any;
    isDefaultDB: boolean;
    driverName: drivers;
    driver?: any;
    name?: string;
    connect(a?: any): void;
  }

  export interface DatabaseDrivers {
    [key: string]: DBDriverInterface;
  }

  export type PrismaOptions<U> = {
    useDynamicPrismaClient: boolean;
    /** Path to the generated Prisma client (relative to src/). */
    client: string;
    /** Path to schema.prisma (relative to project root). */
    schema?: string;
    dims?: PrismaClient;
    globals?: any;
  };

  export type MongoDBOptions<U> = {
    connectTimeoutMS: number;
    socketTimeoutMS: number;
    serverSelectionTimeoutMS: number;
    globals?: any;
  };

  /**
   * Supported Drizzle adapter sub-paths from drizzle-orm.
   * The underlying database client package must be installed separately:
   *   "node-postgres"   → npm i pg
   *   "postgres-js"     → npm i postgres
   *   "mysql2"          → npm i mysql2
   *   "better-sqlite3"  → npm i better-sqlite3
   *   "libsql"          → npm i @libsql/client
   */
  export type DrizzleAdapter =
    | "node-postgres"
    | "postgres-js"
    | "mysql2"
    | "better-sqlite3"
    | "libsql"
    | (string & {});

  export type DrizzleOptions<U = unknown> = {
    /**
     * Drizzle adapter sub-path to import from drizzle-orm.
     * e.g. "node-postgres" → drizzle-orm/node-postgres
     */
    adapter: DrizzleAdapter;

    /**
     * Path to the schema file (relative to src/).
     * The file should export Drizzle table definitions as named exports.
     * e.g. "./container/drizzle/schema"
     * Once loaded, each table is accessible via:
     *   this.models.connectionName.tableName
     */
    schema?: string;

    /**
     * Extra options forwarded directly to the drizzle() constructor.
     * Use this to pass a pre-built client (required for mysql2, postgres-js):
     *   globals: { client: mysqlConnection }
     * or to configure Drizzle logger, cache, etc.:
     *   globals: { logger: true }
     */
    globals?: Record<string, unknown>;
  };

  export type DBProperty<drivers, U = null> = {
    driver: drivers;
    /** Connection string / DSN. For SQLite, use the file path or ":memory:". */
    url: string;
    /**
     * MongoDB database name (not used by Drizzle or Prisma drivers).
     * Optional so Drizzle connections don't need to declare it.
     */
    db?: string;
    params?: string;
    hideLogConnectionStrings?: boolean;
    options: PrismaOptions<U> | MongoDBOptions<U> | DrizzleOptions<U>;
  };

  export type DatabaseConfig = {
    /**
     * Connection name declared in [DatabaseConfig.connections].
     */
    host: string;

    /**
     * Throws an execution error if one of the DB connections failed to connect.
     */
    bootWithDB: boolean;

    /**
     * The default connection used by models that do not specify one.
     */
    default: string;

    /**
     * Hides connection strings in terminal log output.
     */
    hideLogConnectionStrings: boolean;

    /**
     * Named database connection definitions. All entries connect at boot.
     */
    connections: Record<string, DBProperty<drivers, U>>;

    /**
     * Directories scanned for Mongoose model files.
     * Not used by Drizzle or Prisma connections.
     */
    modelsDir?: string[];
  };
}
