const mongoose = require("mongoose");

const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: "",
    unique: true,
  },
  expires: {
    type: Date,
    default: Date.now,
  },
  deviceUID: {
    type: String,
    default: "",
    required: true,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("user", UserSchema, "users");

module.exports = User;
