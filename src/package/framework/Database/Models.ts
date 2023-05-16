import Base from "../../Base.js";
import { DatabaseDrivers, Iobject } from "../Interfaces.js";

export const ModelCollection: Iobject = {};

export default class Models extends Base {
  static $databases: DatabaseDrivers;
  static collection: Iobject = ModelCollection;
  static config: any;
  static async collect() {
    let dirs = Models.config.modelsDir;
    for (let dir in dirs) {
      (await Models._fsFetchDir(dirs[dir])).map((content: any) => {
        Models.collection[content.modelName?.toLowerCase()] = content;
      });
    }
  }

  static async init(dbs: DatabaseDrivers, config: any) {
    try {
      Models.$databases = dbs;
      Models.config = config;
      await Models.collect();
      return Models;
    } catch (e) {
      Logger.log(e)
    }
  }
}
