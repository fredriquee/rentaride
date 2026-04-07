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
    type: String,
    required: true
  },
  image: {
    type: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("Vehicle", vehicleSchema);