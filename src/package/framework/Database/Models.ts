import { Schema } from "mongoose";
import Base from "../../Base.js";
import { DatabaseDrivers, Iobject } from "../Interfaces.js";

export default class Models extends Base {
  static $databases: DatabaseDrivers;
  static collection: Iobject = {};
  static config: any;
  static async collect() {
    let dirs = Models.config.modelsDir;
    for (let dir in dirs) {
      (await Models._fsFetchDir(dirs[dir])).map((content: any) => {
        Models.collection[content.modelName] = content;
      });
    }
  }

  static async init(dbs: DatabaseDrivers, config: any) {
    Models.$databases = dbs;
    Models.config = config;
    await Models.collect();
    return;
  }
}
