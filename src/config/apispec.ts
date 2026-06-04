import type { ApiSpecConfig } from "../container/modules/ApiSpecs/ApiSpec.types.js";

export default <ApiSpecConfig>{
  /**
   * Master switch for spec generation.
   * Set to `false` to disable without removing configuration.
   * Controlled by env var APISPEC_ENABLED; defaults to true.
   */
  enabled: checkout(process.env.APISPEC_ENABLED, "true") !== "false",

  /**
   * Output file configuration.
   * The file is written to the project root (next to package.json) on every boot.
   * Change `filename` to namespace multiple specs (e.g. "v1.spec.json").
   */
  output: {
    filename: checkout(process.env.APISPEC_OUTPUT, "api.spec.json"),
    pretty: true,
  },

  /**
   * OpenAPI document metadata and server declarations.
   * `info.title` is surfaced in Swagger UI and API catalogues.
   */
  definition: {
    openapi: "3.0.0",
    info: {
      title: checkout(process.env.APPNAME, "Chasi") + " API",
      version: "1.0.0",
      description: "",
    },
    servers: [
      {
        url: `http://localhost:${checkout(process.env.ServerPort, "3010")}`,
        description: "Development server",
      },
    ],
  },

  /**
   * Shared components available to all endpoint specs via `$ref`.
   *
   * Model schemas are collected automatically from all active database
   * connections (MongoDB / Prisma / Drizzle) and merged into `schemas`
   * at boot — no need to declare them here.
   *
   * ─── Adding a custom response ────────────────────────────────────────────
   *   responses: {
   *     Unauthorized: {
   *       description: "Missing or invalid JWT",
   *       content: {
   *         "application/json": {
   *           schema: { type: "object", properties: { message: { type: "string" } } }
   *         }
   *       }
   *     },
   *     NotFound: { description: "Resource not found" },
   *   }
   * Reference from an endpoint spec: `$ref: '#/components/responses/Unauthorized'`
   *
   * ─── Adding a reusable parameter ─────────────────────────────────────────
   *   parameters: {
   *     PageParam: {
   *       name: "page", in: "query", required: false,
   *       schema: { type: "integer", default: 1 }
   *     }
   *   }
   * Reference: `$ref: '#/components/parameters/PageParam'`
   *
   * ─── Adding a custom schema ───────────────────────────────────────────────
   *   schemas: {
   *     ErrorResponse: {
   *       type: "object",
   *       properties: { message: { type: "string" }, status: { type: "integer" } }
   *     }
   *   }
   */
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT Authorization header — Bearer <token>",
      },
    },
    // responses: {},
    // parameters: {},
    // schemas: {},
  },

  /**
   * Controls which database connections and which models within each connection
   * are included in the auto-collected `components.schemas` block.
   * Omit this option entirely to collect from every connection and every model.
   *
   * Connection keys match the keys in `config/database.ts` connections.
   * Model names are matched case-insensitively:
   *   - MongoDB  → Mongoose model name  (e.g. "user")
   *   - Prisma   → Prisma model name    (e.g. "User")
   *   - Drizzle  → table export name    (e.g. "users", "userApps")
   *
   * `include` and `exclude` are mutually exclusive — `include` wins if both are set.
   *
   * @example — exclude the test DB and skip the users table from PG
   * schemas: {
   *   drivers: { exclude: ["test"] },
   *   models:  { pg: { exclude: ["users", "userApps"] } },
   * }
   */
  schemas: {
    /**
     * Schema key format in `components.schemas`.
     *
     * "plain"    (default) → bare model name:          user, users, User
     * "prefixed"           → connection-prefixed name:  [dev]user, [pg]users, [mysql]User
     *
     * Regardless of this setting every schema object always contains an
     * `x-driver` field with the source connection name.
     */
    keyFormat: "prefixed",

    drivers: {
      // exclude: ["test"],                          // skip the test DB entirely
      // include: ["pg", "dev"],                  // or: allowlist specific drivers
    },
    models: {
      pg:    { exclude: ["users", "userApps"] },  // skip these Drizzle tables
      dev:   { exclude: ["user"] },               // skip this Mongoose model
      mysql: { exclude: ["UserApp"] },        // only include these Prisma models
      // mysql: { include: ["Post", "Tag"] },        // only include these Prisma models
    },
  },

  /**
   * Global security requirement applied to every protected route.
   * Routes registered in a router's `AuthRouteExceptions` automatically
   * receive `security: []` (public) regardless of this setting.
   * Individual endpoint specs can override this with their own `security` field.
   */
  security: [{ bearerAuth: [] }],
};