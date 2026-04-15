const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: {
    type: Number,
    required: true,
    description: "Amount in paisa (1 Rs = 100 paisa)"
  },
  currency: {
    type: String,
    default: "NPR"
  },
  status: {
    type: String,
    enum: ["initiated", "pending", "completed", "failed", "cancelled", "refunded"],
    default: "initiated"
  },
  
  // Khalti payment details
  pidx: {
    type: String,
    description: "Payment identifier from Khalti",
    index: true
  },
  payment_url: {
    type: String,
    description: "Khalti payment gateway URL"
  },
  transaction_id: {
    type: String,
    description: "Transaction ID from Khalti after successful payment"
  },
  tidx: {
    type: String,
    description: "Same as transaction_id, returned by Khalti"
  },
  khalti_mobile: {
    type: String,
    description: "Khalti ID (mobile) used for payment"
  },
  
  // Additional metadata
  purchase_order_id: {
    type: String,
    required: true,
    unique: true,
    description: "Unique identifier for this payment order"
  },
  purchase_order_name: {
    type: String,
    required: true,
    description: "Order name/description"
  },
  
  // Payment details breakdown
  amount_breakdown: [{
    label: String,
    amount: Number
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  paymentInitiatedAt: {
    type: Date,
    description: "When the payment was initiated at Khalti"
  },
  paymentCompletedAt: {
    type: Date,
    description: "When the payment was completed"
  },
  
  // Error tracking
  errorMessage: {
    type: String,
    description: "Error message if payment fails"
  },
  
  // Customer info for payment
  customer_info: {
    name: String,
    email: String,
    phone: String
  }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
