import Model from "../../package/statics/Model.js";
import mongoose from "mongoose";

export interface UserModelInterface {
  name: string;
  alias: string;
  email: string;
}

var userSchema = new mongoose.Schema<UserModelInterface>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  alias: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
  },
});

export default Model.connect("user", userSchema, "local");
