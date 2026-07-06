/**
 * TEST-ONLY fixture model — NOT part of the app cycle or release.
 *
 * Loaded into `Models.collection` only during the deep-test run, via the
 * `DEEP_TEST_MODELS` entry appended to `modelsDir` (see src/config/database.ts +
 * deep-test/.env.test). Production never sets that flag, so this is never
 * scanned, loaded, or shipped. Mirrors the container/models/*.ts pattern.
 */
import Model from "../../../../src/package/statics/Model.js";
import mongoose from "mongoose";

const unitSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "property",
      required: true,
    },
  },
  { timestamps: true },
);

const Unit = Model.connect("unit", unitSchema, "test");
export default Unit;
