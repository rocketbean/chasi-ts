import { ExceptionsConfig } from "./types.js";

export default <ExceptionsConfig>{
  /**
   * Controls where runtime exceptions are logged.
   * Only the destination set in `type` is active — the others are standby config.
   *
   * Available types:
   *   `"terminal"` — prints to stdout; automatically suppressed in production.
   *   `"database"` — writes a record to the named DB connection in `params.database`.
   *   `"http"`     — POSTs the exception payload to an external endpoint.
   *   `"textfile"` — appends a structured entry to a file on disk.
   */
  LogType: {
    /**
     * Active log destination.
     * Switch between `"terminal" | "database" | "http" | "textfile"` depending
     * on your deployment environment and observability stack.
     */
    type: "terminal",

    /**
     * Configuration for each log destination.
     * Only the block matching the active `type` above is used at runtime;
     * the rest are ignored but kept here for easy switching.
     */
    params: {
      /**
       * Settings for the `"database"` log type.
       * The named connection must be declared in `config/database.ts`.
       */
      database: {
        /** Database connection name to write exception logs into. */
        connection: checkout(process.env.database, "dev"),
      },

      /**
       * Settings for the `"http"` log type.
       * Both `url` and `method` must be non-empty for this type to work.
       * Useful for forwarding errors to an external logging service (e.g. Sentry intake).
       */
      http: {
        /** Fully-qualified URL that receives the exception payload. */
        url: "",
        /** HTTP verb for the log request (typically `"POST"`). */
        method: "",
      },

      /**
       * Settings for the `"textfile"` log type.
       * The file is created if it does not exist; entries are appended.
       */
      textfile: {
        /** Absolute or project-relative path to the log file. */
        path: "",
      },
    },
  },

  /**
   * Custom exception class registry.
   * Generate a new exception with `chasi create exception {ExceptionName}`,
   * then register it here so the framework's error-handling pipeline can
   * resolve and instantiate it by name.
   * Paths must point to the compiled `.js` output file, not the `.ts` source.
   */
  registry: {
    ChasiException: "./package/framework/ErrorHandler/exceptions/ChasiException.js",
    APIException: "./package/framework/ErrorHandler/exceptions/APIException.js",
  },

  /**
   * Default HTTP response messages, keyed by status code.
   * When a thrown exception does not provide its own `message`, Chasi looks up
   * the matching status code here and uses this string as the response body.
   * The `"default"` entry is the catch-all fallback for unmapped status codes.
   */
  responses: {
    302: "SOS",
    401: "we can't verify your token! ",
    404: "Oops, we can't find what you're looking for.",
    500: "It seems we're having a problem processing your request",
    422: "Request cannot be processed, please check the request body",
    default: "ServerError, please try again later!",
  },
};
