const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email field is required"],
      max: 255,
      min: [6, "email field must be at least 6 characters"],
    },
    password: {
      type: String,
      required: [true, "Password field is required"],
      max: 1024,
      min: [6, "password field must be at least 6 characters"],
    },
    username: {
      type: String,
      required: [true, "Username field is required"],
      max: 255,
      min: [2, "username field must be at least 2 characters"],
    },
    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user",
    },
    releases: {
      type: Object,
    },
  },
  { versionKey: false, timestamps: true }
);

UserSchema.methods.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

module.exports = mongoose.model("user", UserSchema);
