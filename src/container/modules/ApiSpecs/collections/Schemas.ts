import type { DatabaseDrivers, DBDriverInterface } from "Chasi/Database";
import type { ApiSpecSchemaFilter, ApiSpecSchemaKeyFormat } from "../ApiSpec.types.js";

// ─── Schema field types ───────────────────────────────────────────────────────

type RawSchemaField = { type: string };
type RawSchemaModel = Record<string, RawSchemaField>;

// ─── MongoDB driver types ─────────────────────────────────────────────────────

interface MongoSchemaPath {
  instance: string;
}

interface MongoConnectionModel {
  schema: { paths: Record<string, MongoSchemaPath> };
}

interface MongoDBDriver extends DBDriverInterface {
  connection: { models: Record<string, MongoConnectionModel> };
  name: string;
}

// ─── Prisma driver types ──────────────────────────────────────────────────────

interface PrismaField {
  name: string;
  type: string;
  kind: string;
  isRequired: boolean;
  isList: boolean;
}

interface PrismaRuntimeModel {
  fields: PrismaField[];
}

interface PrismaRuntimeDataModel {
  models: Record<string, PrismaRuntimeModel>;
}

interface PrismaInternalDriver {
  _runtimeDataModel?: PrismaRuntimeDataModel;
  [key: string]: unknown;
}

interface PrismaDBDriver extends DBDriverInterface {
  driver: PrismaInternalDriver | null;
  name: string;
}

// ─── Drizzle driver types ─────────────────────────────────────────────────────

interface DrizzleColumn {
  dataType: string;
}

type DrizzleTable = Record<string, DrizzleColumn>;

interface DrizzleDBDriver extends DBDriverInterface {
  models: Record<string, DrizzleTable>;
  name: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDatabases(): DatabaseDrivers {
  return ($app as { $modules: { Database: { $databases: DatabaseDrivers } } })
    .$modules["Database"].$databases;
}

function isDrizzleTable(table: DrizzleTable): boolean {
  return (
    Object.getPrototypeOf(table)?.constructor?.name
      ?.toLowerCase()
      .includes("table") ?? false
  );
}

// ─── SchemaCollection ─────────────────────────────────────────────────────────

export default class SchemaCollection {
  static schemas: Record<string, RawSchemaModel> = {};

  get collections(): Record<string, RawSchemaModel> {
    return SchemaCollection.schemas;
  }

  async init(filter?: ApiSpecSchemaFilter): Promise<void> {
    this.collectSchemas(filter);
  }

  collectSchemas(filter?: ApiSpecSchemaFilter): void {
    const collections = getDatabases();
    Object.keys(collections).forEach((key: string) => {
      if (key === "_") return;
      if (!SchemaCollection.isDriverAllowed(key, filter)) return;
      if (collections[key].config.driver === "mongodb") {
        this.collectMongoSchemas(collections[key] as MongoDBDriver, filter);
      }
    });
    this.collectPrismaSchemas(filter);
    this.collectDrizzleSchemas(filter);
  }

  collectMongoSchemas(db: MongoDBDriver, filter?: ApiSpecSchemaFilter): void {
    const instance = db.connection.models;
    const dbName = db.name;
    Object.keys(instance).forEach((model: string) => {
      if (!SchemaCollection.isModelAllowed(dbName, model, filter)) return;
      const key = `[${dbName}]${model}`;
      SchemaCollection.schemas[key] = {};
      Object.keys(instance[model].schema.paths).forEach((property: string) => {
        SchemaCollection.schemas[key] = {
          ...SchemaCollection.schemas[key],
          [property]: {
            type: instance[model].schema.paths[property].instance,
          },
        };
      });
    });
  }

  collectPrismaSchemas(filter?: ApiSpecSchemaFilter): void {
    const collections = getDatabases();
    Object.keys(collections).forEach((key: string) => {
      if (key === "_") return;
      if (!SchemaCollection.isDriverAllowed(key, filter)) return;
      const db = collections[key] as PrismaDBDriver;
      const runtimeModels = db.driver?._runtimeDataModel?.models ?? {};
      if (!Object.keys(runtimeModels).length) return;
      Object.keys(runtimeModels).forEach((model: string) => {
        if (!SchemaCollection.isModelAllowed(key, model, filter)) return;
        const schemaKey = `[${db.name}]${model}`;
        SchemaCollection.schemas[schemaKey] = {};
        const fields: PrismaField[] = runtimeModels[model].fields ?? [];
        fields.forEach((field: PrismaField) => {
          SchemaCollection.schemas[schemaKey] = {
            ...SchemaCollection.schemas[schemaKey],
            [field.name]: { type: field.type },
          };
        });
      });
    });
  }

  collectDrizzleSchemas(filter?: ApiSpecSchemaFilter): void {
    const collections = getDatabases();
    Object.keys(collections).forEach((key: string) => {
      if (key === "_") return;
      if (!SchemaCollection.isDriverAllowed(key, filter)) return;
      const db = collections[key] as DrizzleDBDriver;
      const models = db.models;
      if (!models || !Object.keys(models).length) return;
      Object.keys(models).forEach((model: string) => {
        if (!isDrizzleTable(models[model])) return;
        if (!SchemaCollection.isModelAllowed(key, model, filter)) return;
        const schemaKey = `[${db.name}]${model}`;
        SchemaCollection.schemas[schemaKey] = {};
        Object.keys(models[model]).forEach((column: string) => {
          SchemaCollection.schemas[schemaKey] = {
            ...SchemaCollection.schemas[schemaKey],
            [column]: { type: models[model][column].dataType },
          };
        });
      });
    });
  }

  // ─── Filter helpers ───────────────────────────────────────────────────────

  /**
   * Returns true when the connection key should be collected.
   * `include` takes precedence over `exclude` if both are set.
   */
  static isDriverAllowed(key: string, filter?: ApiSpecSchemaFilter): boolean {
    const { include, exclude } = filter?.drivers ?? {};
    if (include?.length) return include.includes(key);
    if (exclude?.length) return !exclude.includes(key);
    return true;
  }

  /**
   * Returns true when the model name should be collected for the given driver.
   * Matching is case-insensitive. `include` takes precedence over `exclude`.
   */
  static isModelAllowed(
    driverKey: string,
    modelName: string,
    filter?: ApiSpecSchemaFilter
  ): boolean {
    const modelFilter = filter?.models?.[driverKey];
    if (!modelFilter) return true;
    const { include, exclude } = modelFilter;
    const lower = modelName.toLowerCase();
    if (include?.length) return include.some((n) => n.toLowerCase() === lower);
    if (exclude?.length) return !exclude.some((n) => n.toLowerCase() === lower);
    return true;
  }

  // ─── Type mapping ──────────────────────────────────────────────────────────

  /**
   * Maps a driver-native type string to an OpenAPI-compatible type string.
   */
  static mapFieldType(driverType: string): string {
    const map: Record<string, string> = {
      // Mongoose / MongoDB
      String: "string",
      Number: "number",
      Boolean: "boolean",
      Date: "string",
      ObjectId: "string",
      Mixed: "object",
      Array: "array",
      Buffer: "string",
      Map: "object",
      Decimal128: "number",
      // Prisma
      string: "string",
      Int: "integer",
      BigInt: "integer",
      Float: "number",
      Decimal: "number",
      bool: "boolean",
      DateTime: "string",
      Json: "object",
      Bytes: "string",
      // Drizzle
      number: "number",
      boolean: "boolean",
      date: "string",
      bigint: "integer",
      json: "object",
      custom: "string",
    };
    return map[driverType] ?? "string";
  }

  /**
   * Converts the raw driver-keyed schema collection into OpenAPI 3.x
   * component schemas.
   *
   * @param keyFormat
   *   `"plain"`    (default) — schema key is the bare model name: `user`, `users`
   *   `"prefixed"` — schema key retains the connection prefix: `[dev]user`, `[pg]users`
   *
   * Every entry always includes an `x-driver` extension field with the
   * source connection name so the origin is machine-readable regardless of format.
   */
  toOpenApiSchemas(keyFormat: ApiSpecSchemaKeyFormat = "plain"): Record<string, object> {
    const out: Record<string, object> = {};
    for (const rawKey of Object.keys(SchemaCollection.schemas)) {
      const driver = rawKey.match(/^\[(.*?)\]/)?.[1] ?? "unknown";
      const modelName = rawKey.replace(/^\[.*?\]/, "");
      const schemaKey = keyFormat === "prefixed" ? `${driver}:${modelName}` : modelName;

      const fields = SchemaCollection.schemas[rawKey];
      const properties: Record<string, object> = {};
      for (const [field, meta] of Object.entries(fields)) {
        properties[field] = { type: SchemaCollection.mapFieldType(meta.type) };
      }

      out[schemaKey] = {
        "x-driver": driver,
        type: "object",
        properties,
      };
    }
    return out;
  }
}
