import path from "path";
import fs from "fs";
import _ from "lodash";
import { pathToFileURL } from "url";
import { Iobject } from "./framework/Interfaces.js";

/**
 * Resolve a filesystem path into a specifier safe for dynamic `import()`.
 *
 * On Windows an absolute path (`C:\…`) is rejected by the ESM loader with
 * `ERR_UNSUPPORTED_ESM_URL_SCHEME`, so it must be passed as a `file://` URL.
 * On POSIX a raw absolute path is accepted by both Node and bundler loaders
 * (e.g. Vite under Vitest), and — unlike a `file://` URL — needs no
 * percent-encoding, which keeps project paths containing spaces working.
 *
 * `platform` is injectable purely so the Windows branch can be exercised in
 * tests on a non-Windows host; production callers pass nothing and get the
 * current platform.
 */
export const importSpecifier = (
  p: string,
  platform: NodeJS.Platform = process.platform
): string => (platform === "win32" ? pathToFileURL(p).href : p);
export const ProxyHandler: ProxyHandler<Record<string, unknown>> = {
  get: (target: Record<string, unknown>, prop: string | symbol): unknown => {
    const key = prop as string;
    if (key in target && key[0] !== "_") {
      if (typeof target[key] === "function") {
        return (target[key] as Function).bind(target);
      } else {
        return target[key];
      }
    } else {
      throw new Error(`Property "${String(prop)}" is not accessible`);
    }
  },
};

export default class Base {
  async fetchFilesFromDir(dir: string): Promise<Record<string, unknown>> {
    const _mods: Record<string, unknown> = {};
    const _fp = path.join(__filepath, dir);
    await Promise.all(
      fs.readdirSync(path.join(___location, dir)).map(async (file: string) => {
        const _fn_ = file.replace(".js", "").replace(".ts", "");
        _mods[_fn_] = await import(importSpecifier(path.join(_fp, file)))
          .then((_content) => _content.default)
          .catch((e: unknown) => {
            console.log(e);
          });
      })
    );
    return _mods;
  }

  async NamespacedfetchFilesFromDir(dir: string): Promise<Record<string, unknown>> {
    const _mods: Record<string, string> = {};
    this.getFileDirectories(path.join(___location, dir), _mods);
    const result: Record<string, unknown> = {};
    await Promise.all(
      Object.keys(_mods).map(async (key) => {
        let _fp = __testMode() ? key : importSpecifier(key + ".js");
        result[key] = await import(_fp)
          .then((_content) => _content.default)
          .catch((e: unknown) => {
            console.log(e);
          });
      })
    );
    return result;
  }

  getFileDirectories(distPath: string, _mods: Record<string, string>): string[] {
    try {
      return fs
        .readdirSync(distPath)
        .filter((file: string) => {
          const stat = fs.statSync(path.join(distPath, file)).isDirectory();
          if (!stat) _mods[path.join(distPath, file.replace(".js", ""))] = file;
          if (stat) return fs.statSync(path.join(distPath, file)).isDirectory();
        })
        .reduce<string[]>((all, subDir) => {
          return [
            ...all,
            ...this.getFileDirectories(path.join(distPath, subDir), _mods).map(
              (e) => path.join(subDir, e)
            ),
          ];
        }, []);
    } catch (e: unknown) {
      Logger.log(e, "@er");
      return [];
    }
  }

  async fetchFilesFromDirs(dirs: string[]): Promise<Record<string, unknown>[]> {
    return Promise.all(
      dirs.map(async (dir: string) => {
        return await this.fetchFilesFromDir(dir);
      })
    );
  }

  async fetchFile(filepath: string): Promise<unknown> {
    let ext = path.extname(filepath);
    if (!ext) filepath += ".js";
    const _fp = path.join(__filepath, filepath);
    return (await import(importSpecifier(_fp))).default;
  }

  static fetchSync(filepath: string): Promise<unknown> {
    let ext = path.extname(filepath);
    if (!ext) filepath += ".js";
    const _fp = path.join(__filepath, filepath);
    return import(importSpecifier(_fp));
  }

  static mergeObjects<T extends object>(target: T, sources: Partial<T>): T {
    return _.merge(target, sources);
  }

  static async _fetchFile(filepath: string, asDefault: boolean = true): Promise<unknown> {
    try {
      let ext = path.extname(filepath);
      ext = ext == ".mw" ? "" : ext;
      if (!ext) filepath += __testMode() ? ".ts" : ".js";
      const _fp = path.join(__filepath, filepath);
      const _c = await import(importSpecifier(_fp));
      return asDefault ? _c.default : _c;
    } catch (e: unknown) {
      console.log(e);
    }
  }

  static async _fsFetchDir<T>(dir: string): Promise<T[]> {
    const _p = path.join(__filepath, dir);
    const _absDir = path.join(___location, dir);
    if (!fs.existsSync(_absDir)) return [];
    return await Promise.all(
      fs.readdirSync(_absDir).map(async (file: string) => {
        try {
          const content: T = (await import(importSpecifier(path.join(_p, file)))).default;
          return content;
        } catch (e: unknown) {
          console.log(e);
        }
      })
    );
  }

  static _fsFetchFile(
    filepath: string,
    options: Iobject = { encoding: "utf-8" }
  ): Buffer | string {
    return fs.readFileSync(path.resolve(___location, filepath), options);
  }

  static _resetApp(): Promise<unknown> {
    const _fp = path.join(__filepath, "server.js");
    return import(importSpecifier(_fp));
  }

  static async _fetchFilesFromDir(dir: string): Promise<Record<string, unknown>> {
    const _mods: Record<string, unknown> = {};
    const _fp = path.join(__filepath, dir);
    await Promise.all(
      fs.readdirSync(path.join(___location, dir)).map(async (file: string) => {
        const _fn_ = file.replace(".js", "").replace(".ts", "");
        _mods[_fn_] = await import(importSpecifier(path.join(_fp, file)))
          .then((_content) => _content.default)
          .catch((e: unknown) => {
            console.log(e);
          });
      })
    );
    return _mods;
  }

  static async _writeOrUpdateFile(filepath: string, content: string): Promise<boolean | void> {
    try {
      await fs.promises.writeFile(filepath, content);
      return true;
    } catch (e: unknown) {
      Logger.log(e);
    }
  }

  static async Ignition(): Promise<Iobject> {
    return (await Base._fetchFilesFromDir(_configpath_)) as Iobject;
  }
}
