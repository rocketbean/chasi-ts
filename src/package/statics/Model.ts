import { Schema } from "mongoose";
import Models from "../framework/Database/Models.js";
export default class Model extends Models {
  static connect(name: string, schema: Schema, con: string = "_") {
    return Model.$databases[con].connection.model(name, schema);
  }
}
