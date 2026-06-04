// ─── ApiSpec module types ─────────────────────────────────────────────────────

export type ApiSpecVersion = "3.0.0" | "3.1.0";

// ─── Output ──────────────────────────────────────────────────────────────────

export type ApiSpecOutputConfig = {
  /**
   * File name for the generated spec.
   * Written to the project root (same directory as package.json).
   * e.g. "api.spec.json"
   */
  filename: string;
  /** Pretty-print the JSON output. Defaults to true. */
  pretty?: boolean;
};

// ─── Info ────────────────────────────────────────────────────────────────────

export type ApiSpecInfoContact = {
  name?: string;
  email?: string;
  url?: string;
};

export type ApiSpecInfoLicense = {
  name: string;
  url?: string;
};

export type ApiSpecInfo = {
  title: string;
  version: string;
  description?: string;
  termsOfService?: string;
  contact?: ApiSpecInfoContact;
  license?: ApiSpecInfoLicense;
};

// ─── Server ──────────────────────────────────────────────────────────────────

export type ApiSpecServer = {
  url: string;
  description?: string;
};

// ─── Security Schemes ────────────────────────────────────────────────────────

export type ApiSpecSecuritySchemeHttp = {
  type: "http";
  scheme: "bearer" | "basic" | (string & {});
  bearerFormat?: string;
  description?: string;
};

export type ApiSpecSecuritySchemeApiKey = {
  type: "apiKey";
  name: string;
  in: "query" | "header" | "cookie";
  description?: string;
};

export type ApiSpecSecuritySchemeOAuth2 = {
  type: "oauth2";
  flows: Record<string, unknown>;
  description?: string;
};

export type ApiSpecSecuritySchemeOpenId = {
  type: "openIdConnect";
  openIdConnectUrl: string;
  description?: string;
};

export type ApiSpecSecurityScheme =
  | ApiSpecSecuritySchemeHttp
  | ApiSpecSecuritySchemeApiKey
  | ApiSpecSecuritySchemeOAuth2
  | ApiSpecSecuritySchemeOpenId;

// ─── Components ──────────────────────────────────────────────────────────────

/**
 * User-defined components merged into the generated spec's `components` block.
 * Auto-collected model schemas (from all active DB drivers) are merged into
 * `schemas` automatically — no need to declare them here.
 *
 * All entries can be referenced from endpoint specs via `$ref`:
 *   `$ref: '#/components/schemas/MyModel'`
 *   `$ref: '#/components/responses/Unauthorized'`
 *   `$ref: '#/components/parameters/PageParam'`
 */
export type ApiSpecComponents = {
  /** Custom schemas merged with auto-collected model schemas. */
  schemas?: Record<string, object>;
  /** Reusable response definitions. */
  responses?: Record<string, object>;
  /** Reusable parameter definitions. */
  parameters?: Record<string, object>;
  /** Security scheme definitions referenced by `security` requirements. */
  securitySchemes?: Record<string, ApiSpecSecurityScheme>;
  /** Reusable request body definitions. */
  requestBodies?: Record<string, object>;
  /** Reusable header definitions. */
  headers?: Record<string, object>;
  /** Reusable example definitions. */
  examples?: Record<string, object>;
};

// ─── Schema collection filters ───────────────────────────────────────────────

/**
 * Include/exclude list for a single axis (drivers or models within a driver).
 * `include` and `exclude` are mutually exclusive — `include` takes precedence.
 */
export type ApiSpecSchemaAxisFilter = {
  /**
   * Allowlist. Only these names are collected; everything else is skipped.
   * Mutually exclusive with `exclude`.
   */
  include?: string[];
  /**
   * Denylist. These names are skipped; everything else is collected.
   * Mutually exclusive with `include` (`include` wins if both are set).
   */
  exclude?: string[];
};

/**
 * How schema names are formatted in `components.schemas`.
 *
 * - `"plain"`    (default) — model name only: `user`, `users`, `User`
 * - `"prefixed"` — connection name + model name: `[dev]user`, `[pg]users`
 *
 * Every schema always receives an `x-driver` extension field with the
 * source connection name regardless of this setting, so the origin is
 * always machine-readable.
 */
export type ApiSpecSchemaKeyFormat = "plain" | "prefixed";

/**
 * Controls which database connections and which models within each connection
 * are included in the auto-collected schema set.
 *
 * Connection keys match the keys declared in `config/database.ts` connections
 * (e.g. `"dev"`, `"test"`, `"pg"`, `"mysql"`).
 *
 * Model names are matched case-insensitively and correspond to:
 *   - MongoDB  — the Mongoose model name (e.g. `"user"`)
 *   - Prisma   — the Prisma model name (e.g. `"User"`)
 *   - Drizzle  — the table export name  (e.g. `"users"`, `"userApps"`)
 */
export type ApiSpecSchemaFilter = {
  /**
   * Controls how schema keys appear in `components.schemas`.
   * Defaults to `"plain"` (model name only, e.g. `user`).
   * Use `"prefixed"` to include the connection name (e.g. `[dev]user`)
   * — useful when multiple drivers expose models with the same name.
   *
   * @example
   * keyFormat: "prefixed"
   * // components.schemas keys: "dev:user", "pg:users", "mysql:User"
   * // $ref: '#/components/schemas/pg:users'
   */
  keyFormat?: ApiSpecSchemaKeyFormat;

  /**
   * Driver-level filter. Controls which connection keys participate in
   * auto-collection.
   *
   * @example
   * // exclude the test DB and the local DB entirely
   * drivers: { exclude: ["test", "local"] }
   *
   * @example
   * // only collect from these two connections
   * drivers: { include: ["pg", "dev"] }
   */
  drivers?: ApiSpecSchemaAxisFilter;

  /**
   * Model-level filter, keyed by connection name.
   * Applied after the driver-level filter.
   *
   * @example
   * models: {
   *   pg:    { exclude: ["users", "userApps"] },   // skip these Drizzle tables
   *   dev:   { exclude: ["user"] },                 // skip this Mongoose model
   *   mysql: { include: ["Post", "Tag"] },          // only include these Prisma models
   * }
   */
  models?: Record<string, ApiSpecSchemaAxisFilter>;
};

// ─── Definition ──────────────────────────────────────────────────────────────

export type ApiSpecDefinition = {
  /** OpenAPI version string. */
  openapi: ApiSpecVersion;
  /** API metadata. */
  info: ApiSpecInfo;
  /** Server base URLs. First entry is used as the default in Swagger UI. */
  servers?: ApiSpecServer[];
};

// ─── Root config ─────────────────────────────────────────────────────────────

export type ApiSpecConfig = {
  /**
   * Master switch. When `false` the module does nothing at boot —
   * no collections run and no JSON is written to disk.
   */
  enabled: boolean;

  /**
   * Where and how to write the generated spec file.
   */
  output: ApiSpecOutputConfig;

  /**
   * OpenAPI document metadata, version, and server declarations.
   */
  definition: ApiSpecDefinition;

  /**
   * Components merged into the generated spec.
   * Auto-collected model schemas are always included under `schemas`.
   * Use this block to define shared responses, parameters, securitySchemes, etc.
   * that individual endpoint specs can reference via `$ref`.
   */
  components?: ApiSpecComponents;

  /**
   * Controls which database connections and models are included in the
   * auto-collected schema set written to `components.schemas`.
   * Omit to collect from all connections and all models (default behaviour).
   */
  schemas?: ApiSpecSchemaFilter;

  /**
   * Global security requirement applied to all protected routes.
   * Routes listed in a router's `AuthRouteExceptions` receive `security: []`
   * automatically.
   * Per-endpoint spec can override this by declaring its own `security` field.
   */
  security?: Array<Record<string, string[]>>;
};

// ─── Assembled document types ─────────────────────────────────────────────────

/** A single OpenAPI operation object. */
export type ApiSpecOperation = {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: unknown[];
  requestBody?: unknown;
  responses?: Record<string, unknown>;
  security?: Array<Record<string, string[]>>;
  deprecated?: boolean;
  [key: string]: unknown;
};

/** A single OpenAPI path item (method → operation). */
export type ApiSpecPathItem = Record<string, ApiSpecOperation>;

/** The fully assembled OpenAPI 3.x document. */
export type ApiSpecDocument = {
  openapi: ApiSpecVersion;
  info: ApiSpecInfo;
  servers?: ApiSpecServer[];
  components?: Record<string, unknown>;
  security?: Array<Record<string, string[]>>;
  paths: Record<string, ApiSpecPathItem>;
};