import Model from "../../package/statics/Model.js";
import mongoose from "mongoose";

export interface PropertyInterface extends Document {
  name: string;
  code: string;
  units: mongoose.Schema.Types.ObjectId[];
}

export interface PropertyModel extends mongoose.Model<PropertyInterface> {}

var propertySchema = new mongoose.Schema<PropertyInterface>({
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
    units: [
      { type: mongoose.Schema.Types.ObjectId, ref: "unit" },
    ],
  },
  {
    timestamps: true,
  });

const Property = Model.connect<PropertyInterface, PropertyModel>("property", propertySchema, "test");
export type ModelType = PropertyModel;
export default Property;
