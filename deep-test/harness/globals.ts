/**
 * Installs chasi-ts framework globals for the UNIT tier.
 *
 * `src/package/helper.ts` registers a set of globals on import as a side effect
 * (checkout, Logger, Caveat, __testMode, _getMethods, __getRandomStr, __deepEqual,
 * __deepMerge, path refs, etc.). Most framework classes assume these exist.
 *
 * Unit tests that touch any framework class should import this module so those
 * globals are present WITHOUT booting the full server (no DB/HTTP/socket).
 *
 *   import "../../harness/globals.ts";
 */
import "../../src/package/helper.js";

export {};
