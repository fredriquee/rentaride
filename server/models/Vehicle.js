const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  pricePerDay: {
    type: Number,
    required: true
  },
  location: {
    type: String
  },
  image: {
    type: String
  },
  images: {
    type: [String],
    default: []
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  status: {
    type: String,
    enum: ["available", "unavailable", "maintenance"],
    default: "available"
  }
}, { timestamps: true });

module.exports = mongoose.model("Vehicle", vehicleSchema);