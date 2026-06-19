import { serverConfig } from "../package/framework/Interfaces.js";
import os from "os";

export default <serverConfig>{
  /**
   * Port (or ports) the server may listen on.
   *
   * Three forms are accepted:
   *   number              — single port:           3010
   *   number[]            — explicit list:         [3010, 3011, 3012]
   *   { start, end }      — inclusive range:       { start: 3010, end: 3020 }
   *
   * When the chosen port is already in use the runtime automatically tries
   * the next candidate in order until one succeeds.
   * `process.env.ServerPort` overrides this value; accepted string forms are
   * a single number (`"3010"`), a range (`"3010-3020"`), or a comma-separated
   * list (`"3010,3011"`).
   */
  port: checkout(process.env.ServerPort, { start: 3010, end: 3020 }),

  /**
   * Active server environment name.
   * Must match one of the keys declared in `modes` below.
   * Determines which SSL certificate paths and protocol (`http`/`https`) are used.
   * Sourced from `process.env.environment`; falls back to `"local"`.
   */
  environment: checkout(process.env.environment, "local"),

  /**
   * CORS (Cross-Origin Resource Sharing) options passed directly to the `cors` npm package.
   * Controls which origins and headers browsers are allowed to send cross-origin.
   * Full option reference: https://www.npmjs.com/package/cors
   */
  cors: {
    /**
     * Allowed request origins.
     * `"*"` permits any origin — restrict this in production to specific domains
     * (e.g. `"https://yourapp.com"` or an array of allowed origins).
     */
    origin: "*",

    /**
     * HTTP headers the browser is allowed to send in a cross-origin request.
     * Add any custom headers your API clients include (e.g. `"X-Request-ID"`).
     */
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Methods",
      "Access-Control-Request-Headers",
    ],

    /**
     * Whether the browser should send cookies or HTTP auth headers cross-origin.
     * Must be `true` if your API relies on session cookies; requires `origin`
     * to be a specific domain (not `"*"`) when enabled.
     */
    credentials: false,

    /**
     * When `true`, Chasi automatically handles HTTP OPTIONS preflight requests.
     * Disable only if you are handling preflight manually at the Express level.
     */
    enablePreflight: true,
  },

  /**
   * Node.js cluster configuration.
   * When `enabled`, Chasi forks the app into multiple worker processes — one per
   * `workers` entry — allowing parallel request handling across CPU cores.
   *
   * Tips:
   *   - Don't max out all cores (`os.cpus().length`); leave at least one for the OS.
   *   - Set `environment` in `compiler.ts` to `"prod"` before enabling clustering,
   *     as Vite's dev server is incompatible with multi-process mode.
   *   - Load-test with `loadtest -n 1000 -c 200 http://localhost:<port>/api/`
   *     to find the right `workers` value for your hardware.
   */
  serviceCluster: {
    /**
     * Enables worker process clustering.
     * `false` runs the app in a single process (default for development).
     */
    enabled: checkout(process.env.CLUSTER, false),

    /**
     * Tracks memory heap usage across workers and logs it periodically.
     * Useful for detecting memory leaks under load.
     */
    trackUsage: {
      /** Activates heap usage tracking. Has no effect when `enabled` is `false`. */
      enabled: false,
      /** How often (in milliseconds) to log each worker's heap stats. */
      interval: 500,
    },

    /**
     * Logs worker thread startup/shutdown events to the console.
     * Helpful for verifying that the cluster forked the expected number of workers.
     */
    logs: true,

    /**
     * Number of worker processes to spawn.
     * Defaults to half the available logical CPU count to leave headroom.
     * Tune this based on load-test results for your specific workload.
     */
    workers: Number(checkout(process.env.WORKERS, Math.round(os.cpus().length / 2))),

    /**
     * Low-level Node.js cluster settings forwarded to `cluster.setupPrimary()`.
     * See: https://nodejs.org/docs/latest/api/cluster.html#clustersetupprimarysettings
     */
    settings: {},

    /**
     * How the primary process distributes incoming connections to workers.
     * `1` — None: delegates distribution to the OS (default on Windows).
     * `2` — Round-robin: primary assigns connections in turn (default on non-Windows).
     *
     * Note: round-robin (`2`) may under-perform on Windows — test and adjust.
     */
    schedulingPolicy: 2,
  },

  /**
   * Chasi lifecycle hooks.
   * These functions intercept key moments in the server startup sequence,
   * giving you a place to run async setup code before the Express app is live.
   */
  hooks: {
    /**
     * Runs before Chasi initializes the Express application.
     * The default implementation triggers the Vite compiler `hook()` on each
     * engine declared in `config/compiler.ts`, ensuring SSR bundles are
     * built (or the dev server is started) before any requests are handled.
     *
     * @param getConfig - Function that returns a parsed config section by name
     *                    (e.g. `getConfig("compiler")` returns the compiler config).
     */
    beforeApp: async (getConfig: Function) => {
      let compiler = getConfig("compiler");
      await Promise.all(
        compiler.engines.map(async (engine) => {
          await engine.hook(getConfig, engine);
        }),
      );
    },
  },

  /**
   * Named server environment definitions.
   * Each key corresponds to a value that `environment` above can be set to.
   * Add new entries here to support additional environments (e.g. `"staging"`).
   * The active entry determines SSL cert paths and the HTTP protocol used.
   */
  modes: {
    /**
     * HTTPS development environment.
     * Requires a locally-trusted TLS certificate (e.g. generated with mkcert).
     * `devKey` and `devCert` env vars should point to the `.key` and `.crt` files.
     */
    dev: {
      key: checkout(process.env.devKey),
      cert: checkout(process.env.devCert),
      /**
       * Optional trusted CA chain. Supply this when you don't want to bundle
       * the intermediate/root certs into `cert`. Accepts a single path or an
       * array of paths, e.g. `ca: [process.env.devCa, "certs/root.pem"]`.
       */
      // ca: checkout(process.env.devCa),
      protocol: "https",
    },

    /**
     * Plain HTTP local environment (no TLS).
     * Default for local development — no certificate setup required.
     */
    local: {
      key: null,
      cert: null,
      protocol: "http",
    },
  },
};
