import path from "path";
import fs from "fs";
import _ from "lodash";
import { Iobject } from "./framework/Interfaces.js";
export const ProxyHandler = {
  get: (target, prop, receiver) => {
    if (prop in target && prop[0] !== "_") {
      if (typeof target[prop] === "function") {
        return target[prop].bind(target);
      } else {
        return target[prop];
      }
    } else {
      throw new Error("problem");
    }
  },
};

export default class Base {
  async fetchFilesFromDir(dir: string): Promise<object> {
    let _mods: { [key: string]: object } = {};
    let _fp = path.join(__filepath + dir);
    await Promise.all(
      fs.readdirSync(path.join(___location, dir)).map(async (file: string) => {
        let _fn_ = file.replace(".js", "").replace(".ts", "");
        _mods[_fn_] = await import(path.join(_fp, file))
          .then((_content) => _content.default)
          .catch((e) => {
            console.log(e);
          });
      })
    );
    return _mods;
  }

  async NamespacedfetchFilesFromDir(dir: string): Promise<object> {
    let _mods: { [key: string]: object } = {};
    this.getFileDirectories(path.join(___location, dir), _mods);
    await Promise.all(
      Object.keys(_mods).map(async (key) => {
        let _fp = path.join("file:", key);
        _fp = __testMode() ? _fp : _fp + ".js";
        _mods[key] = await import(_fp)
          .then((_content) => _content.default)
          .catch((e) => {
            console.log(e);
          });
      })
    );
    return _mods;
  }

  getFileDirectories(distPath, _mods) {
    try {
      return fs
        .readdirSync(distPath)
        .filter(function (file) {
          let stat = fs.statSync(distPath + "/" + file).isDirectory();
          if (!stat) _mods[path.join(distPath, file.replace(".js", ""))] = file;
          if (stat) return fs.statSync(path.join(distPath, file)).isDirectory();
        })
        .reduce((all, subDir) => {
          return [
            ...all,
            ...this.getFileDirectories(path.join(distPath, subDir), _mods).map(
              (e) => subDir + "/" + e
            ),
          ];
        }, []);
    } catch (e) {
      Logger.log(e, "@er");
    }
  }

  async fetchFilesFromDirs(dirs: string[]) {
    return Promise.all(
      dirs.map(async (dir: string) => {
        return await this.fetchFilesFromDir(dir);
      })
    );
  }

  async fetchFile(filepath: string) {
    let ext = path.extname(filepath);
    if (!ext) filepath += ".js";
    let _fp = path.join(__filepath, filepath);
    return (await import(_fp)).default;
  }

  static fetchSync(filepath: string) {
    let ext = path.extname(filepath);
    if (!ext) filepath += ".js";
    let _fp = path.join(__filepath, filepath);
    return import(_fp);
  }

  static mergeObjects(target: object, sources: any) {
    return _.merge(target, sources);
  }

  static async _fetchFile(filepath: string, asDefault = true) {
    try {
      let ext = path.extname(filepath);
      ext = ext == ".mw" ? null : ext;
      if (!ext) filepath += __testMode() ? ".ts" : ".js";
      let _fp = path.join(__filepath, filepath);
      let _c = await import(_fp);
      return asDefault ? _c.default : _c;
    } catch (e) {
      console.log(e);
    }
  }

  static async _fsFetchDir<T>(dir: string): Promise<T[]> {
    let _p = path.join(__filepath, dir);
    return await Promise.all(
      fs.readdirSync(path.join(___location, dir)).map(async (file: string) => {
        try {
          let content = (
            (await import(`${path.join(_p, file)}`)).default
          );
          return content;
        } catch (e) {
          console.log(e);
        }
      })
    );
  }

  static _fsFetchFile(
    filepath: string,
    options: Iobject = { encoding: "utf-8" }
  ) {
    return fs.readFileSync(path.resolve(___location, filepath), options);
  }

  static _resetApp() {
    let _fp = path.join(__filepath + "server.js");
    return import(_fp);
  }

  static async _fetchFilesFromDir(dir: string): Promise<object> {
    let _mods: { [key: string]: object } = {};
    let _fp = path.join(__filepath + dir);
    await Promise.all(
      fs.readdirSync(path.join(___location, dir)).map(async (file: string) => {
        let _fn_ = file.replace(".js", "").replace(".ts", "");
        _mods[_fn_] = await import(path.join(_fp, file))
          .then((_content) => _content.default)
          .catch((e) => {
            console.log(e);
          });
      })
    );
    return _mods;
  }

  static async _writeOrUpdateFile(filepath: string, content: string) {
    try {
      await fs.promises.writeFile(filepath, content);
      return true;
    } catch (e) {
      Logger.log(e);
    }
  }

  /**
   * Start Server
   */
  static async Ignition(): Promise<{ [key: string]: any }> {
    return (await Base._fetchFilesFromDir(_configpath_)) as Iobject;
  }
}
