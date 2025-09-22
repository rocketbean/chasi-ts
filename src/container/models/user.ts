import Model from "../../package/statics/Model.js";
import Authorization from "../../package/statics/Authorization.js";
import mongoose, { Document, Schema } from "mongoose";
import bc from "bcryptjs";
import jwt from "jsonwebtoken";
import CustomError from "../errors/CustomError.js";

export interface UserInterface extends Document {
  _id: string;
  name: string;
  password: string;
  alias: string;
  email: string;
  appSession?: any;
  apps?: mongoose.Schema.Types.ObjectId[];
  /**
   * @param authType string : must be the same as what is configured in
   * RouterServiceProvider.Router[auth],
   * and must be registered to config/authentication[driver]
   * @returns JWTToken
   */
  generateAuthToken: Function;
  generatePassword: Function;
}

export interface UserModel extends mongoose.Model<UserInterface> {
  findByCredentials(email: string, pass: string): UserInterface;
}

var userSchema = new mongoose.Schema<UserInterface>(
  {
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
    apps: [
      { type: mongoose.Schema.Types.ObjectId, ref: "userapp", unique: true },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bc.hash(user.password, 8);
  }
  next();
});

userSchema.set("toJSON", {
  transform: function (doc, ret, opt) {
    delete ret["password"];
    return ret;
  },
});

userSchema.statics.findByCredentials = async (email, pass) => {
  if (!email || !pass)
    throw new CustomError(
      "missing required parameters['email','password']",
      422
    );
  const user = await User.findOne({ email });
  if (!user) throw new CustomError("email can't be found", 422);
  const isMatch = await bc.compare(pass, user.password);
  if (!isMatch)
    throw new CustomError("wrong credentials have been supplied", 401);
  user.appSession = user.email;
  return user;
};

userSchema.methods.generateAuthToken = async function (
  authType = "_"
): Promise<{ [key: string]: any }> {
  const user = this;
  const gateway = Authorization.$drivers[authType];
  return await jwt.sign({ _id: user._id.toString() }, gateway.property.key);
};

const User = Model.connect<UserInterface, UserModel>("user", userSchema, "dev");
export default User;
