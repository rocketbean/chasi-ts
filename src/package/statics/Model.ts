import mongoose, { Schema, model } from "mongoose";
import Models from "../framework/Database/Models.js";

export default class Model extends Models {
  /** static[connect()]
   * method that specifies a connection of a model.
   * @param name[String] schema name
   * @param schema[Mongoose.Schema] object
   * @param connection[string] connection name where this model will connect to. default is "_"
   */
  static connect<T>(name: string, schema: Schema, connection: string = "_"): T {
    if (Model.$databases[connection]?.connection) {
      return Model.$databases[connection]?.connection?.model(name, schema) as T;
    }
  }
}
