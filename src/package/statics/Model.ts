import mongoose, { Schema, model, HydratedDocument } from "mongoose";
import Models from "../framework/Database/Models.js";

export default class Model extends Models {
  /** static[connect()]
   * method that specifies a connection of a model.
   * @param name[String] schema name
   * @param schema[Mongoose.Schema] object
   * @param connection[string] connection name where this model will connect to. default is "_"
   */
  static connect<T = {}, K = {}>(
    name: string,
    schema: Schema<T, K>,
    connection: string = "_"
  ): mongoose.Model<T, K> {
    try {

      if (Model.$databases[connection].config.driver === "mongodb") {
        if (Model.$databases[connection]?.connection) {
          return Model.$databases[connection]?.connection?.model(
            name,
            schema
          ) as mongoose.Model<T, K>;
        }
      }

    } catch (e) {
      Logger.log(`Model[${name}] unable to connect to Con[${connection}]`);
      Logger.log(e);
    }

  }
}
