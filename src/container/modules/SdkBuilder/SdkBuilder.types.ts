import type { RouteExceptions } from "Chasi/Router";
import type { SdkMiddlewareFn } from "Chasi/Router";

// ─── Formatter ───────────────────────────────────────────────────────────────

/**
 * A function that receives the raw generated SDK code and returns the
 * processed version. May be synchronous or asynchronous.
 *
 * @example — terser (default, see formatters/terser.ts)
 * @example — uglify-js@3: (code) => UglifyJS.minify(code).code
 * @example — prettier:    (code) => prettier.format(code, { parser: "babel" })
 */
export type SdkBuilderFormatter = (code: string) => string | Promise<string>;

// ─── HTTP client ──────────────────────────────────────────────────────────────

/**
 * HTTP client used in the generated SDK bundle.
 * `"fetch"` (default) — native Fetch API, no extra dependencies.
 * `"axios"`           — requires axios to be installed in the consumer app.
 * Any other string is written verbatim into the import statement.
 */
export type SdkBuilderHttpClient = "fetch" | "axios" | (string & {});

// ─── Output ───────────────────────────────────────────────────────────────────

export type SdkBuilderOutput = {
  /**
   * File name (or relative path) for the generated SDK bundle.
   * Always resolved from the project root. The directory is created
   * automatically if it does not exist.
   * e.g. "api.sdk.js" or "sdk/api.sdk.js"
   */
  filename: string;
  /**
   * Optional formatter executed on the generated code before writing to disk.
   * Use the built-in `terserFormatter` (default) or supply any function that
   * takes a code string and returns a processed string (sync or async).
   * Omit to write the raw generated output without any post-processing.
   */
  formatter?: SdkBuilderFormatter;
};

// ─── Config ───────────────────────────────────────────────────────────────────

export type SdkBuilderConfig = {
  /**
   * Master switch. When `false` the module does nothing at boot.
   * Controlled by env var SDKBUILDER_ENABLED.
   */
  enabled: boolean;

  /**
   * Base URL of the backend injected into the generated SDK as `HOST`.
   * Every generated request function is prefixed with this value.
   * e.g. "http://localhost:3010"
   */
  host: string;

  /**
   * Output file configuration.
   */
  output: SdkBuilderOutput;

  /**
   * HTTP client used inside the generated SDK bundle.
   * Defaults to `"fetch"` (no extra dependencies).
   * Set to `"axios"` to emit axios-based request code — the consumer app
   * must have axios installed.
   */
  httpClient?: SdkBuilderHttpClient;

  /**
   * Names of routers (from RouterServiceProvider) to include in the SDK.
   * Omit or leave empty to include all registered routers.
   * e.g. ["api"]
   */
  routers?: string[];

  /**
   * Routes excluded from the generated SDK.
   * Mirrors the shape of `AuthRouteExceptions` in RouterServiceProvider.
   *
   * @example
   * exclude: [
   *   { m: "post", url: "/api/users/forget" },
   * ]
   */
  exclude?: RouteExceptions[];
};

// ─── Internal collected route shape ──────────────────────────────────────────

/**
 * Normalised metadata for a single registered endpoint,
 * produced by the Routes collector and consumed by the Compiler.
 */
export type SdkRouteEntry = {
  /** Full Express path, e.g. "/api/users/signin" */
  path: string;
  /** HTTP method, lowercase, e.g. "post" */
  method: string;
  /** True when the route requires a Bearer token. */
  isProtected: boolean;
  /** Effective middleware aliases (after .except() exclusions). */
  middlewares: string[];
  /** Whether the endpoint has .sdk() handlers registered. */
  hasSdkHandlers: boolean;
  /** Registered sdk() handler functions. */
  sdkHandlers: SdkMiddlewareFn[];
  /** Required fields derived from endpoint spec.requestBody schema. */
  requiredFields: string[];
  /**
   * Namespace segments derived from the path.
   * e.g. "/api/users/signin" → ["users"]
   */
  namespace: string[];
  /**
   * camelCased function name derived from the last path segment.
   * e.g. "pg-signup" → "pgSignup"
   */
  functionName: string;
};

/**
 * Context object forwarded to sdk() handlers during the build phase.
 * Handlers receive this as their first `...params` argument.
 */
export type SdkBuildContext = {
  config: SdkBuilderConfig;
  route: SdkRouteEntry;
};
