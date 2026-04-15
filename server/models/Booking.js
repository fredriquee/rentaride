const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "cancellation_requested", "completed"],
    default: "pending"
  },
  cancellationReason: {
    type: String
  },
  
  // Payment relationship
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment"
  }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);