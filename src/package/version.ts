import fs from "fs";
import path from "path";

let _cached: string | undefined;

/**
 * The current chasi-ts version, sourced directly from the project's
 * `package.json["chasiVersion"]` field.
 *
 * The root `package.json` lives outside `rootDir` (`./src`), so it cannot be
 * statically imported without breaking the `tsc` emit layout. Instead it is
 * read once at runtime from the project root — resolved from the framework's
 * `___location` global, which points at the run directory (`dist/` in prod,
 * `src/` under tests), making its parent the project root in every mode.
 *
 * Falls back to the `version` field, then npm's injected env vars, then
 * `"unknown"`. The result is cached after the first read.
 */
export function chasiVersion(): string {
  if (_cached) return _cached;
  try {
    const root = path.resolve(___location, "..");
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf-8"));
    _cached = pkg.chasiVersion ?? pkg.version ?? "unknown";
  } catch {
    _cached =
      process.env.npm_package_chasiVersion ??
      process.env.npm_package_version ??
      "unknown";
  }
  return _cached;
}
