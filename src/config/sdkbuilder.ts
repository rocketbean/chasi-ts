import type { SdkBuilderConfig } from "../container/modules/SdkBuilder/SdkBuilder.types.js";
import { terserFormatter } from "../container/modules/SdkBuilder/formatters/terser.js";

export default <SdkBuilderConfig>{
  /**
   * chasi generates a separate SDK bundle for every entry in `output`. Each
   * entry is self-contained — its own enable switch, host, router selection,
   * http client, output file, and formatter — so a project serving multiple
   * APIs can emit one dedicated SDK per API. Every entry needs a unique
   * `namespace` (used to register/track outputs without collision).
   *
   * @example — a second output for an admin API
   * output: [
   *   { namespace: "api",   ... routers: ["api"] },
   *   { namespace: "admin", enabled: true, host: "http://localhost:3010",
   *     routers: ["admin"], httpClient: "fetch", filename: "sdk/admin.sdk.js",
   *     formatter: terserFormatter },
   * ]
   */
  output: [
    {
      /** Unique key for this output (prevents collisions across outputs). */
      namespace: "api",

      /**
       * Master switch for this output. Set to `false` to disable without
       * removing configuration.
       * Controlled by env var SDKBUILDER_ENABLED; defaults to false.
       */
      enabled: checkout(process.env.SDKBUILDER_ENABLED, "true") !== "false",

      /**
       * Base URL injected into this SDK as `HOST`.
       * Every request function is prefixed with this value.
       * Controlled by env var SDK_HOST.
       */
      host: checkout(
        process.env.SDK_HOST,
        `http://localhost:${checkout(process.env.ServerPort, "3010")}`
      ),

      /**
       * Router names (from RouterServiceProvider) to include in this SDK.
       * Omit or set to [] to include all registered routers.
       */
      routers: ["api"],

      /**
       * HTTP client used in the generated SDK bundle.
       *
       * "fetch" (default) — native Fetch API, no extra dependencies.
       *                     Works in modern browsers and Node.js 18+.
       * "axios"           — axios-based requests; the consumer app must
       *                     have axios installed (`npm i axios`).
       */
      httpClient: "fetch",

      /**
       * Routes excluded from this SDK.
       * Mirrors RouterServiceProvider's AuthRouteExceptions shape.
       *
       * @example
       * exclude: [
       *   { m: "post", url: "/api/users/forget" },
       * ]
       */
      exclude: [
        { m: "post", url: "/api/users/forget" },
      ],

      /**
       * Output file written to the project root on every boot.
       * Controlled by env var SDKBUILDER_OUTPUT.
       */
      filename: checkout(process.env.SDKBUILDER_OUTPUT, "sdk/chasi.sdk.js"),

      /**
       * Formatter applied to the generated bundle before writing to disk.
       * Default: terser (minify + mangle).
       *
       * Swap to any function that takes a code string and returns a string:
       *   import prettier from "prettier";
       *   formatter: (code) => prettier.format(code, { parser: "babel" })
       *
       * Set to undefined to write the raw output without post-processing.
       */
      formatter: terserFormatter,

      /**
       * Opt-in typed output — emits a sibling `.d.ts` next to the `.js` during
       * `npm run build` (build mode only; never at server-boot runtime). Off by
       * default. Controlled by env var SDKBUILDER_TYPED.
       * declarationFile / sourceRoot / typesRoot / formatter default in code.
       */
      typed: {
        enabled: checkout(process.env.SDKBUILDER_TYPED, "true") !== "false",
        typeModule: "Chasi/Http/v1",
        responseStrategy: "auto",
        fallback: { request: "Record<string, any>", response: "any" },
        strict: checkout(process.env.SDKBUILDER_STRICT, "false") !== "false",
        // "inline" (default) → self-contained, portable .d.ts (types copied in,
        // no external imports). "import" → reference typeModule instead (only
        // for a monorepo / shared-types consumer that can resolve it).
        emit: "inline",
      },
    },
  ],
};
