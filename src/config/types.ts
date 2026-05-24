import { RouteExceptions } from "../package/framework/Interfaces.js";

// ─── Authentication ───────────────────────────────────────────────────────────

/**
 * Configuration for a single authentication driver instance.
 * Each driver entry is keyed by an arbitrary name (e.g. "dev", "prod")
 * and maps to a specific auth strategy such as JWT.
 */
export type AuthDriverConfig = {
  /**
   * The authentication strategy to use.
   * Currently supported: `"jwt"`.
   * Determines how incoming tokens are verified and decoded.
   */
  driver: "jwt" | (string & {});

  /**
   * Path to a custom auth handler file that implements the `AuthDriver` interface.
   * When `null`, Chasi uses its built-in JWT handler.
   * Use this to plug in a custom token strategy (e.g. OAuth2, API keys).
   */
  handler: string | null;

  /**
   * Secret key used to sign and verify JWT tokens.
   * Keep this value in environment variables — never hard-code secrets in source.
   * Changing this key will invalidate all currently issued tokens.
   */
  key: string;

  /**
   * Name of the Mongoose model (from `container/models/`) that represents
   * an authenticated user. Chasi attaches the resolved document to
   * `request.auth` after a successful token verification.
   */
  model: string;

  /**
   * Routes that bypass the auth guard entirely.
   * Useful for public endpoints (login, signup, health checks).
   * Note: `request.auth` will be `undefined` on excepted routes.
   */
  AuthRouteExceptions: RouteExceptions[];
};

/**
 * Top-level authentication configuration shape.
 * Keyed by driver name so multiple auth strategies can coexist
 * (e.g. one for the REST API, another for an admin panel).
 */
export type AuthenticationConfig = {
  /**
   * Map of named authentication driver configurations.
   * Each router references one of these by name via its `auth` property.
   */
  drivers: Record<string, AuthDriverConfig>;
};

// ─── Container ────────────────────────────────────────────────────────────────

/**
 * Session-level options that govern logging and in-memory caching
 * behaviour during the Chasi boot lifecycle.
 */
export type ContainerSession = {
  /**
   * When `true`, Chasi retains an in-memory cache of boot session data
   * across requests. Useful for reducing repeated I/O at the cost of memory.
   */
  cache: boolean;

  /**
   * When `true`, Chasi writes boot/session events to the configured log stream.
   * Disable in production if session noise clutters your log aggregator.
   */
  useLogStream: boolean;
};

/**
 * Top-level application container configuration.
 * Controls how Chasi discovers and wires controllers, services, and middleware.
 */
export type ContainerConfig = {
  /**
   * Human-readable application name.
   * Displayed in CLI output and framework logs.
   */
  name: string;

  /**
   * Default directory Chasi scans for controller files when a router
   * does not declare its own `controllersDir`.
   * Path is relative to `src/` (compiled: `dist/`).
   */
  ControllerDir: string;

  /**
   * Map of service provider aliases to their file paths.
   * Each entry is auto-initialized in the order declared during boot.
   * Path is relative to `src/` (compiled: `dist/`).
   * Add new service providers here to have them participate in the lifecycle.
   */
  ServiceBootstrap: Record<string, string>;

  /**
   * Map of middleware aliases to their file paths.
   * After registration, middlewares can be referenced by alias inside route
   * definitions (e.g. `middleware: "auth"` in a route group).
   * Path is relative to `src/` (compiled: `dist/`).
   */
  middlewares: Record<string, string>;

  /** Boot session options (caching & log streaming). */
  session: ContainerSession;
};

// ─── Exceptions ───────────────────────────────────────────────────────────────

/**
 * Where framework and application exception logs are written.
 *
 * - `"terminal"` — printed to stdout; suppressed in production.
 * - `"database"` — persisted to the configured DB connection.
 * - `"http"`     — POSTed to an external endpoint.
 * - `"textfile"` — appended to a log file on disk.
 */
export type ExceptionLogType = "terminal" | "database" | "http" | "textfile";

/**
 * Parameters for each supported exception log destination.
 * Only the block that matches the active `LogType.type` is used.
 */
export type ExceptionsLogParams = {
  /** Used when `LogType.type === "database"`. */
  database: {
    /** Named connection from `config/database.ts` to write logs into. */
    connection: string;
  };
  /** Used when `LogType.type === "http"`. Both `url` and `method` must be set. */
  http: {
    /** Fully-qualified URL that receives the exception payload. */
    url: string;
    /** HTTP verb for the log request (e.g. `"POST"`). */
    method: string;
  };
  /** Used when `LogType.type === "textfile"`. */
  textfile: {
    /** Absolute or relative path to the log file. */
    path: string;
  };
};

/**
 * Top-level exceptions configuration.
 * Controls how runtime errors are logged, which custom exceptions are available,
 * and what default HTTP response messages look like.
 */
export type ExceptionsConfig = {
  /**
   * Selects and configures the exception logging destination.
   * Only one `type` is active at a time; `params` holds settings for all types.
   */
  LogType: {
    /** Active log destination. */
    type: ExceptionLogType;
    /** Configuration blocks for each supported destination. */
    params: ExceptionsLogParams;
  };

  /**
   * Map of custom exception class aliases to their file paths.
   * Registered exceptions are available throughout the app via the
   * framework's error-handling pipeline.
   * Paths must point to `.js` files (post-compile).
   */
  registry: Record<string, string>;

  /**
   * Default HTTP response messages keyed by status code.
   * Used when an exception does not supply its own `message`.
   * The `"default"` key is the catch-all fallback.
   */
  responses: Record<number | string, string>;
};
