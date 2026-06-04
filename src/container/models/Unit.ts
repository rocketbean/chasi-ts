import Model from "../../package/statics/Model.js";
import mongoose from "mongoose";

export interface UnitInterface extends Document {
  name: string;
  code: string;
  property: mongoose.Schema.Types.ObjectId;
}

export interface UnitModel extends mongoose.Model<UnitInterface> {}

var unitSchema = new mongoose.Schema<UnitInterface>({
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "property",
      required: true,
    }
  }, 
  {
    timestamps: true,
  });

const Unit = Model.connect<UnitInterface,UnitModel>("unit", unitSchema, "test");
export type ModelType = UnitModel;
export default Unit;
