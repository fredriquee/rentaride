const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  phone: {
    type: String,
    default: ""
  },

  role: {
    type: String,
    enum: ["renter", "owner", "admin"],
    default: "renter"
  },

  currentRole: {
    type: String,
    enum: ["renter", "owner"],
    default: "renter"
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);