import Base from "../../Base.js";
import { DatabaseDrivers } from "Chasi/Database";
import { Iobject } from "../Interfaces.js";
import mongoose from "mongoose";
import path from "path";

export const ModelCollection: Iobject = {};
export default class Models extends Base {
  static $databases: DatabaseDrivers;
  static collection: Iobject = ModelCollection;
  static config: any;

  static async collect() {
    let dirs = Models.config.modelsDir;
    //mongodb model collection
    for (let dir in dirs) {
      let base = path.join(___location, dirs[dir]);
      (await Models._fsFetchDir<any>(dirs[dir])).map((content) => {
        Models.collection[content?.modelName?.toLowerCase()] = content;
      });
    }
    //prisma model collection
    Object.keys(this.$databases).map((db: string) => {
      let _d = this.$databases[db];
      let models = _d["models"];
      Models.collection[db] = {};
      if (_d.driverName === "prisma") {
        Object.keys(_d["models"]).map((model) => {
          Models.collection[db][model] = _d["models"][model];
        });
      }
    });
  }

  static async init(dbs: DatabaseDrivers, config: any) {
    try {
      Models.$databases = dbs;
      Models.config = config;
      await Models.collect();
      return Models;
    } catch (e) {
      Logger.log(e);
    }
  }
}
