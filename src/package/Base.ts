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
      fs.readdirSync(path.join(__dirname, dir)).map(async (file: string) => {
        _mods[file.replace(".js", "")] = await import(path.join(_fp, file))
          .then((_content) => _content.default)
          .catch((e) => {
            console.log(e);
          });
      }),
    );
    return _mods;
  }

  async NamespacedfetchFilesFromDir(dir: string): Promise<object> {
    let _mods: { [key: string]: object } = {};

    let _fp = path.join(__filepath + dir);
    await Promise.all(
      fs.readdirSync(path.join(__dirname, dir)).map(async (file: string) => {
        _mods[path.join(__dirname, dir) + "/" + file.replace(".js", "")] =
          await import(path.join(_fp, file))
            .then((_content) => _content.default)
            .catch((e) => {
              console.log(e);
            });
      }),
    );
    return _mods;
  }

  async fetchFilesFromDirs(dirs: string[]) {
    return Promise.all(
      dirs.map(async (dir: string) => {
        return await this.fetchFilesFromDir(dir);
      }),
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

  static async _fetchFile(filepath: string) {
    try {
      let ext = path.extname(filepath);
      if (!ext) filepath += ".js";
      let _fp = path.join(__filepath, filepath);
      return (await import(_fp)).default;
    } catch (e) {
      console.log(e);
    }
  }

  static async _fsFetchDir(dir: string): Promise<any> {
    let _p = path.join(__filepath, dir);
    return await Promise.all(
      fs.readdirSync(path.join(__dirname, dir)).map(async (file: string) => {
        try {
          return (await import(`${path.join(_p, file)}`)).default;
        } catch (e) {
          console.log(e);
        }
      }),
    );
  }

  static _fsFetchFile(
    filepath: string,
    options: Iobject = { encoding: "utf-8" },
  ) {
    return fs.readFileSync(path.resolve(__dirname, filepath), options);
  }

  static _resetApp() {
    let _fp = path.join(__filepath + "server.js");
    return import(_fp);
  }

  static async _fetchFilesFromDir(dir: string): Promise<object> {
    let _mods: { [key: string]: object } = {};
    let _fp = path.join(__filepath + dir);
    await Promise.all(
      fs.readdirSync(path.join(__dirname, dir)).map(async (file: string) => {
        _mods[file.replace(".js", "")] = await import(path.join(_fp, file))
          .then((_content) => _content.default)
          .catch((e) => {
            console.log(e);
          });
      }),
    );
    return _mods;
  }

  /**
   * Start Server
   */
  static async Ignition(): Promise<{ [key: string]: any }> {
    return (await Base._fetchFilesFromDir(_configpath_)) as Iobject;
  }
}
