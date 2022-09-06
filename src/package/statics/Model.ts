import { Schema } from "mongoose";
import Models from "../framework/Database/Models.js";

export default class Model extends Models {
  /** static[connect()]
   * method that specifies a connection of a model.
   * @param name[String] schema name
   * @param schema[Mongoose.Schema] object
   * @param con[string] connection name where this model will connect to. default is "_"
   */
  static connect(name: string, schema: Schema, con: string = "_") {
    if (Model.$databases[con]?.connection) {
      return Model.$databases[con]?.connection?.model(name, schema);
    } else {
      return schema;
    }
  }
}
