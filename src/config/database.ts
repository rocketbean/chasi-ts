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
    // local: {
    //   driver: "mongodb",
    //   url: process.env.dbConStringLocal,
    //   db: process.env.databaseName,
    //   options: {
    //     /** Longer timeouts for local Docker/VM setups that may be slow to start. */
    //     connectTimeoutMS: 4000,
    //     socketTimeoutMS: 4000,
    //     serverSelectionTimeoutMS: 5000,
    //   },
    // },

    // ─── Drizzle ORM connections ──────────────────────────────────────────────
    //
    // Install the underlying client package for your target database, then
    // uncomment and fill in the connection below.
    //
    // Supported adapters and their peer packages:
    //   "node-postgres"   → npm i pg @types/pg
    //   "postgres-js"     → npm i postgres
    //   "mysql2"          → npm i mysql2
    //   "better-sqlite3"  → npm i better-sqlite3 @types/better-sqlite3
    //   "libsql"          → npm i @libsql/client
    //
    // ─── PostgreSQL (node-postgres) ───────────────────────────────────────────
    // pg: {
    //   driver: "drizzle",
    //   url: process.env.PG_URL,           // e.g. "postgresql://user:pass@localhost:5432/mydb"
    //   options: {
    //     adapter: "node-postgres",
    //     schema: "./container/drizzle/schema",  // path to your schema file (relative to src/)
    //     globals: { logger: false },            // extra drizzle() options (optional)
    //   },
    // },
    //
    // ─── MySQL (mysql2) ───────────────────────────────────────────────────────
    // mysql: {
    //   driver: "drizzle",
    //   url: process.env.MYSQL_URL,        // e.g. "mysql://user:pass@localhost:3306/mydb"
    //   options: {
    //     adapter: "mysql2",
    //     schema: "./container/drizzle/schema",
    //     // mysql2 requires a pre-built connection — pass it via globals.client:
    //     // globals: { client: await mysql.createConnection({ uri: process.env.MYSQL_URL }) },
    //   },
    // },
    //
    // ─── SQLite (better-sqlite3) ──────────────────────────────────────────────
    // sqlite: {
    //   driver: "drizzle",
    //   url: "./data/app.db",              // file path or ":memory:"
    //   options: {
    //     adapter: "better-sqlite3",
    //     schema: "./container/drizzle/schema",
    //   },
    // },
    //
    // ─── Turso / libSQL ───────────────────────────────────────────────────────
    // turso: {
    //   driver: "drizzle",
    //   url: process.env.TURSO_URL,        // e.g. "libsql://your-db.turso.io"
    //   options: {
    //     adapter: "libsql",
    //     schema: "./container/drizzle/schema",
    //     globals: { authToken: process.env.TURSO_AUTH_TOKEN },
    //   },
    // },
  },

  /**
   * Directories Chasi scans for Mongoose model/schema files at boot.
   * Every file in these directories whose exported class extends the base `Model`
   * is registered and made available inside controllers as `this.models.{ModelName}`.
   * Paths are relative to `src/` (or `dist/` after compilation).
   */
  modelsDir: ["./container/models/"],
};
