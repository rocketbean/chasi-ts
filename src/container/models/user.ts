import Model from "../../package/statics/Model.js";
import Authorization from "../../package/statics/Authorization.js";
import mongoose from "mongoose";
import bc from "bcryptjs";
import jwt from "jsonwebtoken";

export interface UserModelInterface {
  name: string;
  password: string;
  alias: string;
  email: string;
}

var userSchema = new mongoose.Schema<UserModelInterface>({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  password: {
    type: String,
    trim: true,
    minlength: 6,
    validate(v) {
      if (v.toLowerCase().includes("password"))
        throw new Error("entry with the word 'password' cannot be used. ");
    },
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

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bc.hash(user.password, 8);
  }
  next();
});

userSchema.statics.findByCredentials = async (email, pass) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("email can't be found");

  const isMatch = await bc.compare(pass, user.password);
  if (!isMatch) throw new Error("wrong credentials have been supplied");
  user.appSession = user.email;
  return user;
};

userSchema.methods.generateAuthToken = async function (authType = "_") {
  const user = this;
  const gateway = Authorization.$drivers[authType];
  return await jwt.sign({ _id: user._id.toString() }, gateway.property.key);
};

const User = Model.connect("user", userSchema);
export default User;
