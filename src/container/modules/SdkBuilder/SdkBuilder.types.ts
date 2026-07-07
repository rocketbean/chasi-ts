import type { RouteExceptions } from "Chasi/Router";
import type { SdkMiddlewareFn } from "Chasi/Router";
import type Endpoint from "../../../package/framework/Router/Endpoint.js";

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

// ─── Router selection ──────────────────────────────────────────────────────────

/**
 * Predicate deciding whether an individual endpoint of a router is included in
 * the SDK. Receives the live route Endpoint — `.path` (full path),
 * `.property.method` (HTTP verb), `.method` (controller method), `.middlewares`,
 * `.spec`, etc. Return `true` to include the endpoint.
 *
 * @example (endpoint) => endpoint.path.includes("/users")
 */
export type SdkRouterFilter = (endpoint: Endpoint) => boolean;

/**
 * Object form of a router selection. (The string form — just the router name —
 * is also accepted and means "the whole router".)
 */
export type SdkRouterSelector = {
  /** Router name from RouterServiceProvider (same value the string form takes). */
  router: string;
  /**
   * Optional wrapper namespace in the generated SDK. When set, this selection's
   * endpoints are nested under it (`namespace.<resource>.<fn>`) — collision-safe
   * when several routers/selections are combined in one output. When omitted,
   * endpoints sit at the top level exactly as before.
   */
  namespace?: string;
  /**
   * Optional endpoint predicate. Only endpoints for which it returns `true` are
   * included; omit to include every endpoint of the router.
   */
  filter?: SdkRouterFilter;
  /**
   * How each function in this selection is named. Optional; defaults to
   * `"controller"`.
   * - `"controller"` (default) — use the controller method (`create`, `list`,
   *   `update`, …), so multiple HTTP verbs on the same path stay distinct.
   * - `"http"` — use the HTTP verb (`get`, `post`, `patch`, …). Note two routes
   *   sharing a resource + verb collapse to one (resolved by a tie-break, logged).
   */
  naming?: "http" | "controller";
};

// ─── Typed output ──────────────────────────────────────────────────────────────

/**
 * Opt-in typed output for a single SDK output. When `enabled` AND the build runs
 * in build mode (npm run build), a sibling `.d.ts` is emitted next to the `.js`,
 * giving consumers type-safe request/response shapes with zero runtime change.
 *
 * The parser needs `typescript` (devDep) + `src/**` on disk — both guaranteed at
 * build time — so the `.d.ts` is never written on the server-boot runtime path.
 */
export type SdkBuilderTyped = {
  /** Emit the `.d.ts` sidecar for this output. Default false. */
  enabled: boolean;
  /** Sidecar path. Default = this output's `filename` with `.js` → `.d.ts`. */
  declarationFile?: string;
  /** Barrel module the emitted types import from. Default "Chasi/Http/v2". */
  typeModule?: string;
  /** Root scanned for controller source (`.ts`). Default `<cwd>/src`. */
  sourceRoot?: string;
  /** Root scanned for `*.d.ts` type barrels. Default "src/types/http/v2". */
  typesRoot?: string;
  /**
   * How response types are resolved:
   * - `"auto"` (default) — trust a verified `<Name>Response` sibling of the
   *   request type when it exists, else fall back.
   * - `"annotation-only"` — never derive a sibling; use fallback unless a
   *   manifest entry provides one.
   */
  responseStrategy?: "auto" | "annotation-only";
  /** Types used when none is found. Default: request `Record<string, any>`, response `any`. */
  fallback?: { request?: string; response?: string };
  /** Per-route overrides keyed by `${verb} ${path}` (lowercase verb). Manifest wins. */
  manifest?: Record<string, { req?: string; res?: string }>;
  /** When true, an untyped *included* route fails the build instead of falling back. Default false. */
  strict?: boolean;
  /**
   * How the emitted `.d.ts` carries its referenced types (the `.js` is never
   * affected):
   * - `"inline"` (default) — copy the referenced barrel types into the `.d.ts`
   *   as module-local namespaces, producing ONE self-contained, portable file
   *   with no external imports. Ship it to any frontend as-is; nothing to
   *   resolve, nothing to clash with.
   * - `"import"` — reference them via `import type … from <typeModule>`. Smaller
   *   and a single source of truth, but the CONSUMER must resolve `typeModule`
   *   (e.g. a monorepo path-map or a shared types package). Not portable alone.
   */
  emit?: "inline" | "import";
  /**
   * Formatter for the `.d.ts`. Default: prettier with `parser: "typescript"`
   * (imported defensively; raw output on failure). Never the runtime
   * `output.formatter` — terser cannot parse `declare`/type syntax.
   */
  formatter?: SdkBuilderFormatter;
};

// ─── Output ───────────────────────────────────────────────────────────────────

export type SdkBuilderOutput = {
  /**
   * Unique identifier for this output. Lets multiple SDK outputs be registered
   * and tracked without collision, and labels the build logs.
   * e.g. "api", "admin", "public"
   */
  namespace: string;
  /**
   * Master switch for this output. When `false` this output is skipped at boot
   * (other outputs are unaffected).
   */
  enabled: boolean;
  /**
   * Base URL injected into this SDK bundle as `HOST`. Every generated request
   * function is prefixed with this value.
   * e.g. "http://localhost:3010"
   */
  host: string;
  /**
   * Routers (from RouterServiceProvider) to include in this SDK. Each item is
   * either:
   *   - a string — the router name; includes the whole router (back-compat); or
   *   - an object `{ router, filter?, namespace? }` — include a subset of a
   *     router's endpoints (`filter`) and/or wrap them under a `namespace`.
   * Omit or leave empty to include all registered routers.
   * e.g. ["api", { router: "admin", namespace: "Admin",
   *               filter: (e) => e.path.includes("/reports") }]
   */
  routers?: (string | SdkRouterSelector)[];
  /**
   * Routes excluded from this SDK.
   * Mirrors the shape of `AuthRouteExceptions` in RouterServiceProvider.
   */
  exclude?: RouteExceptions[];
  /**
   * HTTP client used inside this SDK bundle.
   * Defaults to `"fetch"` (no extra dependencies). Set to `"axios"` to emit
   * axios-based request code — the consumer app must have axios installed.
   */
  httpClient?: SdkBuilderHttpClient;
  /**
   * File name (or relative path) for this generated SDK bundle.
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
  /**
   * Opt-in typed output — emits a sibling `.d.ts` (build mode only). Off by
   * default; see {@link SdkBuilderTyped}.
   */
  typed?: SdkBuilderTyped;
};

// ─── Config ───────────────────────────────────────────────────────────────────

export type SdkBuilderConfig = {
  /**
   * One or more SDK outputs. chasi generates a separate SDK bundle for every
   * entry, so a single project serving multiple APIs can emit one SDK per API —
   * each with its own enable switch, host, router selection, http client,
   * output file, and formatter. Give every entry a unique `namespace`.
   */
  output: SdkBuilderOutput[];
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
  /**
   * Optional wrapper namespace from the router selector. When set, the Compiler
   * nests this entry under `routerNamespace` in the generated SDK.
   */
  routerNamespace?: string;
  /**
   * FQN of the request-body type (e.g. "Organisation.CreateRequest"), populated
   * only when typed output is enabled. Undefined → request fallback.
   */
  reqType?: string;
  /**
   * FQN of the response type (e.g. "Organisation.CreateResponse"), populated
   * only when typed output is enabled. Undefined → response fallback.
   */
  resType?: string;
};

/**
 * Context object forwarded to sdk() handlers during the build phase.
 * Handlers receive this as their first `...params` argument.
 */
export type SdkBuildContext = {
  /** The specific output currently being built. */
  config: SdkBuilderOutput;
  route: SdkRouteEntry;
};
