import DB, { DBProperty, DrizzleOptions } from "Chasi/Database";
import { Writable } from "../../../Logger/types/Writer.js";
import Driver from "./drivers.js";
import Base from "../../../Base.js";
import chalk from "chalk";

export default class DrizzleDriver extends Driver implements DB.DBDriverInterface {
  public driverName = <DB.drivers>"drizzle";
  public isDefaultDB = false;
  public protocol = "";
  public connection: any = null;
  public db: any = null;
  public models: Record<string, any> = {};
  public logger: Writable & { subject?: string };

  constructor(
    public config: DBProperty<"drizzle", DrizzleOptions>,
    public name: string
  ) {
    super(config);
    this.name = name;
    this.logger = Logger.writers.Left;
    this.logger.subject = "database";
  }

  private get opts(): DrizzleOptions {
    return this.config.options as DrizzleOptions;
  }

  /**
   * Loads the Drizzle schema from the path declared in options.schema.
   * The schema file should export Drizzle table definitions as named exports.
   * Returns an empty object when no schema path is configured.
   */
  private async loadSchema(): Promise<Record<string, unknown>> {
    if (!this.opts.schema) return {};
    try {
      const mod = (await Base._fetchFile(this.opts.schema, false)) as Record<string, unknown>;
      const { default: _d, ...tables } = mod;
      return tables;
    } catch {
      Logger.warn(
        `DrizzleDriver[${this.name}]: could not load schema from "${this.opts.schema}" — proceeding without schema`
      );
      return {};
    }
  }

  /**
   * Dynamically imports the drizzle() factory from the configured adapter module.
   * adapter must be a valid drizzle-orm sub-path, e.g. "node-postgres", "mysql2",
   * "better-sqlite3", "libsql", "postgres-js".
   */
  private async getDrizzleFn(): Promise<Function> {
    const mod = (await import(`drizzle-orm/${this.opts.adapter}`)) as {
      drizzle: Function;
    };
    return mod.drizzle;
  }

  /**
   * Populates this.models with:
   *   _db  — the live Drizzle query client
   *   [tableKey] — each named export from the schema file
   * Accessible in controllers as:
   *   this.models.myConn._db  (query client)
   *   this.models.myConn.users (table definition)
   */
  setModels(schema: Record<string, unknown>): void {
    this.models._db = this.db;
    Object.keys(schema).forEach((key) => {
      this.models[key] = schema[key];
    });
  }

  async connect(stop: (msg: string) => void): Promise<any> {
    try {
      const schema = await this.loadSchema();
      const drizzleFn = await this.getDrizzleFn();

      // If options.globals contains a pre-built `client`, skip passing `connection`
      // so the developer's client takes precedence (required for mysql2, postgres-js, etc.).
      // For adapters that accept a connection string directly (node-postgres, better-sqlite3,
      // libsql) the url field is forwarded as `connection`.
      const drizzleConfig: Record<string, unknown> = {
        ...(this.opts.globals?.client ? {} : { connection: this.config.url }),
        ...(Object.keys(schema).length > 0 ? { schema } : {}),
        ...(this.opts.globals ?? {}),
      };

      this.db = drizzleFn(drizzleConfig);
      this.connection = this.db;
      this.setModels(schema);

      stop(
        `  ╡[${this.states[1]("•")}]${
          this.isDefaultDB
            ? chalk.greenBright.underline(this.name.toUpperCase())
            : this.name.toUpperCase()
        }`
      );

      if (this.config.hideLogConnectionStrings) {
        this.logger.write(` - [drizzle/${this.opts.adapter}] (connection string hidden)\n`);
      } else {
        this.logger.write(` - ${this.config.url}\n`);
      }

      return this.db;
    } catch (e) {
      throw e;
    }
  }
}
