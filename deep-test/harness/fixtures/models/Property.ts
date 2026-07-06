/**
 * TEST-ONLY fixture model — NOT part of the app cycle or release. See Unit.ts.
 *
 * `units` holds references to the `unit` model so the integration tier can
 * exercise Mongoose `.populate()`.
 */
import Model from "../../../../src/package/statics/Model.js";
import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    units: [{ type: mongoose.Schema.Types.ObjectId, ref: "unit" }],
  },
  { timestamps: true },
);

const Property = Model.connect("property", propertySchema, "test");
export default Property;
