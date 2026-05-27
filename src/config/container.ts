import { ContainerConfig } from "./types.js";

export default <ContainerConfig>{
  /**
   * Human-readable application name.
   * Shown in CLI startup output and framework log headers.
   * Sourced from the `APPNAME` environment variable; falls back to `"Chasi"`.
   */
  name: global.checkout(process.env.APPNAME, "Chasi"),

  /**
   * Default directory Chasi scans for controller classes.
   * Used when a router does not declare its own `controllersDir`.
   * Path is relative to `src/` (or `dist/` after compilation).
   * A file is registered as a controller only when its exported class
   * extends the base `Controller`.
   */
  ControllerDir: "container/controllers",

  /**
   * Service providers to bootstrap on startup.
   * Each key is an arbitrary alias; the value is a path to the service provider
   * file, relative to `src/` (or `dist/` after compilation).
   * Services are initialized in declaration order during the boot lifecycle.
   *
   * These built-in providers are intentionally left outside the Chasi core so
   * developers can customize or replace them:
   *   - `compiler`  — wires Vite SSR compilation to the Express lifecycle
   *   - `routers`   — registers all named routers and their route containers
   *   - `sockets`   — sets up Socket.IO alongside the HTTP server
   *
   * To add a new service, create a provider in `container/services/` and add
   * an entry here so Chasi picks it up automatically at boot.
   */
  ServiceBootstrap: {
    compiler: "container/services/CompilerEngineServiceProvider",
    routers: "container/services/RouterServiceProvider",
    sockets: "container/services/SocketServiceProvider",
    apispec: "container/services/ApiSpecServiceProvider"
  },

  /**
   * Global middleware registry.
   * Maps a short alias to the middleware file path (relative to `src/`).
   * Once registered here, a middleware can be referenced by its alias
   * inside any route definition or route group:
   *
   *   router.group({ middleware: "auth" }, () => { ... })
   *
   * Registration is required before use — unregistered aliases will throw
   * at boot time when Chasi tries to resolve the middleware.
   */
  middlewares: {
    /** JWT authentication guard — blocks unauthenticated requests. */
    auth: "./container/middlewares/Auth",
    /** Prevents state-changing operations while the app is in test mode. */
    testmode: "./container/middlewares/TestMode.mw",
  },

  /**
   * Options for the internal Chasi boot session.
   */
  session: {
    /**
     * Enables in-memory caching of session data between boot phases.
     * Reduces repeated I/O during startup but increases memory footprint.
     */
    cache: false,

    /**
     * Pipes boot/session lifecycle events into the configured log stream.
     * Disable to reduce log verbosity in environments where session noise is
     * unwanted (e.g. a log aggregator with strict ingestion limits).
     */
    useLogStream: true,
  },
};
