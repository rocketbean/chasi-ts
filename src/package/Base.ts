import path from "path";
import fs from "fs";
import _ from "lodash";

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

  async fetchFilesFromDirs(dirs: string[]) {
    return Promise.all(
      dirs.map(async (dir: string) => {
        return await this.fetchFilesFromDir(dir);
      }),
    );
  }

  async fetchFile(filepath: string) {
    if (!filepath.includes(".js")) filepath += ".js";
    let _fp = path.join(__filepath + filepath);
    return (await import(_fp)).default;
  }

  static mergeObjects(target: object, sources: any) {
    return _.merge(target, sources);
  }

  static async _fetchFile(filepath: string) {
    if (!filepath.includes(".js")) filepath += ".js";
    let _fp = path.join(__filepath + filepath);
    return (await import(_fp)).default;
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
}
