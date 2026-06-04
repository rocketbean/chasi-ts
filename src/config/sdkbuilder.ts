import type { SdkBuilderConfig } from "../container/modules/SdkBuilder/SdkBuilder.types.js";
import { terserFormatter } from "../container/modules/SdkBuilder/formatters/terser.js";

export default <SdkBuilderConfig>{
  /**
   * Master switch. Set to `false` to disable without removing configuration.
   * Controlled by env var SDKBUILDER_ENABLED; defaults to true.
   */
  enabled: checkout(process.env.SDKBUILDER_ENABLED, "true") !== "false",

  /**
   * Base URL injected into the generated SDK as `HOST`.
   * Every request function is prefixed with this value.
   * Controlled by env var SDK_HOST.
   */
  host: checkout(
    process.env.SDK_HOST,
    `http://localhost:${checkout(process.env.ServerPort, "3010")}`
  ),

  /**
   * Output file written to the project root on every boot.
   */
  output: {
    filename: checkout(process.env.SDKBUILDER_OUTPUT, "sdk/chasi.sdk.js"),
    /**
     * Formatter applied to the generated bundle before writing to disk.
     * Default: terser (minify + mangle).
     *
     * Swap to any function that takes a code string and returns a string:
     *   import UglifyJS from "uglify-js";
     *   formatter: (code) => UglifyJS.minify(code).code
     *
     *   import prettier from "prettier";
     *   formatter: (code) => prettier.format(code, { parser: "babel" })
     *
     * Set to undefined to write the raw output without post-processing.
     */
    formatter: terserFormatter,
  },

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
   * Router names (from RouterServiceProvider) to include in the SDK.
   * Omit or set to [] to include all registered routers.
   */
  routers: ["api"],

  /**
   * Routes excluded from the SDK.
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
};
