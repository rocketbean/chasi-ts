import DB, { DatabaseConfig } from "Chasi/Database";

export default <DatabaseConfig>{
  /**
   * The name of the connection used as the "host" reference for this config.
   * Must correspond to a key in `connections` below.
   * Sourced from `process.env.database`; falls back to `"local"`.
   */
  host: checkout(process.env.database, "local"),

  /**
   * When `true`, a failed database connection during boot causes the process to exit.
   * When `false` (default), Chasi logs the failure but continues starting — useful
   * in development so the server still launches even without a live DB.
   * Set to `true` in production to prevent serving traffic without a database.
   */
  bootWithDB: false,

  /**
   * When `true`, hides connection strings (URLs) from terminal log output.
   * Always enable in production to avoid leaking credentials to log aggregators.
   */
  hideLogConnectionStrings: true,

  /**
   * Name of the connection that Models use when they don't specify their own.
   * Must match a key in `connections` below.
   * Sourced from `process.env.database`; falls back to `"local"`.
   * You can override this per-model inside the model's class definition.
   */
  default: checkout(process.env.database, "local"),

  /**
   * Named database connection definitions.
   * All entries are connected automatically during the boot sequence.
   * Reference a specific connection inside a model or via
   * `$getConnection("ConnectionName")` in a controller — if the name doesn't
   * exist, Chasi falls back to the `default` connection silently.
   *
   * Supported drivers: `"mongodb"` | `"prisma"`
   */
  connections: {
    /**
     * Remote development / staging database.
     * Short timeouts (`1 s`) surface connectivity issues quickly during CI runs.
     */
    dev: {
      /** Database driver to use for this connection. */
      driver: "mongodb",
      /** MongoDB connection string (without database name). Read from env. */
      url: process.env.dbConStringDev,
      /** Name of the MongoDB database to select after connecting. */
      db: process.env.devDatabaseName,
      /** Query-string appended to the URL (e.g. auth source, replica set). */
      params: "?authSource=admin",
      options: {
        /** Milliseconds before a connection attempt times out. */
        connectTimeoutMS: 1000,
        /** Milliseconds of inactivity before an open socket is closed. */
        socketTimeoutMS: 1000,
        /** Milliseconds the driver waits to find a suitable server before erroring. */
        serverSelectionTimeoutMS: 5000,
      },
    },

    /** Isolated test database — used during automated test runs. */
    test: {
      driver: "mongodb",
      url: process.env.dbConStringTest,
      db: process.env.testDatabaseName,
      params: "?authSource=admin",
      options: {
        connectTimeoutMS: 1000,
        socketTimeoutMS: 1000,
        serverSelectionTimeoutMS: 5000,
      },
    },

    /**
     * Local development database (no auth, generous timeouts).
     * Default connection when `process.env.database` is not set.
     */
    local: {
      driver: "mongodb",
      url: process.env.dbConStringLocal,
      db: process.env.databaseName,
      options: {
        /** Longer timeouts for local Docker/VM setups that may be slow to start. */
        connectTimeoutMS: 4000,
        socketTimeoutMS: 4000,
        serverSelectionTimeoutMS: 5000,
      },
    },
  },

  /**
   * Directories Chasi scans for Mongoose model/schema files at boot.
   * Every file in these directories whose exported class extends the base `Model`
   * is registered and made available inside controllers as `this.models.{ModelName}`.
   * Paths are relative to `src/` (or `dist/` after compilation).
   */
  modelsDir: ["./container/models/"],
};
