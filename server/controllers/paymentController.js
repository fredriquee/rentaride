const asyncHandler = require("express-async-handler");
const axios = require("axios");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const User = require("../models/User");

// Khalti Configuration
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_SANDBOX_URL = "https://dev.khalti.com/api/v2";
const KHALTI_PRODUCTION_URL = "https://khalti.com/api/v2";
const IS_SANDBOX = process.env.NODE_ENV !== "production";
const KHALTI_API_URL = IS_SANDBOX ? KHALTI_SANDBOX_URL : KHALTI_PRODUCTION_URL;

// Helper function to generate unique purchase order ID
const generatePurchaseOrderId = () => {
  return `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// @desc    Initiate payment with Khalti
// @route   POST /api/payments/initiate
// @access  Private
exports.initiatePayment = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  const userId = req.user._id;

  // Validate booking
  const booking = await Booking.findById(bookingId).populate("vehicle user");
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.user._id.toString() !== userId.toString()) {
    return res.status(403).json({ message: "Unauthorized: This is not your booking" });
  }

  // Check if payment already exists and is pending/completed
  const existingPayment = await Payment.findOne({
    booking: bookingId,
    status: { $in: ["completed", "pending"] }
  });

  if (existingPayment && existingPayment.status === "completed") {
    return res.status(400).json({ message: "Payment already completed for this booking" });
  }

  if (existingPayment && existingPayment.status === "pending") {
    return res.status(400).json({ 
      message: "Payment already initiated",
      payment_url: existingPayment.payment_url,
      pidx: existingPayment.pidx
    });
  }

  // Calculate amount (booking days * daily rate)
  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const dailyRate = booking.vehicle.dailyRate || 2000; // Default daily rate
  const totalAmount = days * dailyRate;

  // Amount in paisa (1 Rs = 100 paisa)
  const amountInPaisa = totalAmount * 100;

  if (amountInPaisa < 1000) {
    return res.status(400).json({ 
      message: "Minimum payment amount is Rs. 10 (1000 paisa)" 
    });
  }

  // Generate purchase order ID
  const purchaseOrderId = generatePurchaseOrderId();

  // Create Khalti payment payload
  const khaltiPayload = {
    return_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment-success`,
    website_url: process.env.FRONTEND_URL || "http://localhost:3000",
    amount: amountInPaisa,
    purchase_order_id: purchaseOrderId,
    purchase_order_name: `RentaRide Booking - ${booking.vehicle.model}`,
    customer_info: {
      name: booking.user.name,
      email: booking.user.email,
      phone: booking.user.phone || ""
    },
    amount_breakdown: [
      {
        label: "Rental Amount",
        amount: amountInPaisa
      }
    ],
    product_details: [
      {
        identity: booking.vehicle._id.toString(),
        name: `${booking.vehicle.make} ${booking.vehicle.model}`,
        total_price: amountInPaisa,
        quantity: 1,
        unit_price: amountInPaisa
      }
    ],
    merchant_username: process.env.KHALTI_MERCHANT_NAME || "RentaRide"
  };

  try {
    // Call Khalti API to initiate payment
    const khaltiResponse = await axios.post(
      `${KHALTI_API_URL}/epayment/initiate/`,
      khaltiPayload,
      {
        headers: {
          "Authorization": `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const { pidx, payment_url, expires_at, expires_in } = khaltiResponse.data;

    // Create payment record in database
    const payment = await Payment.create({
      booking: bookingId,
      user: userId,
      amount: totalAmount,
      amountInPaisa,
      status: "pending",
      pidx,
      payment_url,
      purchase_order_id: purchaseOrderId,
      purchase_order_name: khaltiPayload.purchase_order_name,
      amount_breakdown: khaltiPayload.amount_breakdown,
      customer_info: khaltiPayload.customer_info,
      paymentInitiatedAt: new Date()
    });

    // Update booking to link with payment
    booking.paymentId = payment._id;
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Payment initiated successfully",
      pidx,
      payment_url,
      expires_at,
      expires_in,
      payment: {
        id: payment._id,
        amount: totalAmount,
        amountInPaisa
      }
    });

  } catch (error) {
    console.error("Khalti API Error:", error.response?.data || error.message);
    
    res.status(400).json({
      message: "Failed to initiate payment",
      error: error.response?.data || error.message
    });
  }
});

// @desc    Verify payment (lookup after callback)
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { pidx, bookingId } = req.body;
  const userId = req.user._id;

  if (!pidx) {
    return res.status(400).json({ message: "Payment ID (pidx) is required" });
  }

  // Find payment record
  const payment = await Payment.findOne({ pidx }).populate("booking");
  if (!payment) {
    return res.status(404).json({ message: "Payment record not found" });
  }

  // Verify ownership
  if (payment.user.toString() !== userId.toString()) {
    return res.status(403).json({ message: "Unauthorized: This is not your payment" });
  }

  try {
    // Call Khalti lookup API to verify payment status
    const khaltiResponse = await axios.post(
      `${KHALTI_API_URL}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          "Authorization": `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const { status, transaction_id, total_amount, fee, refunded } = khaltiResponse.data;

    // Update payment record based on Khalti response
    payment.status = status === "Completed" ? "completed" : 
                     status === "Pending" ? "pending" :
                     status === "User canceled" ? "cancelled" : "failed";
    
    if (transaction_id) {
      payment.transaction_id = transaction_id;
      payment.tidx = transaction_id;
    }
    
    if (status === "Completed") {
      payment.paymentCompletedAt = new Date();
      // Update booking status
      const booking = await Booking.findById(payment.booking);
      if (booking && booking.status === "pending") {
        booking.status = "confirmed";
        await booking.save();
      }
    }

    await payment.save();

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      status,
      payment: {
        id: payment._id,
        pidx,
        status: payment.status,
        transaction_id,
        total_amount,
        fee
      },
      booking: {
        id: payment.booking._id,
        status: payment.booking.status
      }
    });

  } catch (error) {
    console.error("Khalti Lookup Error:", error.response?.data || error.message);
    
    res.status(400).json({
      message: "Failed to verify payment",
      error: error.response?.data || error.message
    });
  }
});

// @desc    Handle Khalti callback (from return_url)
// @route   POST /api/payments/callback
// @access  Public (called by Khalti)
exports.handlePaymentCallback = asyncHandler(async (req, res) => {
  const { pidx, status, transaction_id, tidx, amount, purchase_order_id } = req.query;

  if (!pidx) {
    return res.status(400).json({ message: "Missing pidx in callback" });
  }

  try {
    // Verify payment with Khalti
    const khaltiResponse = await axios.post(
      `${KHALTI_API_URL}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          "Authorization": `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const { status: khaltiStatus, transaction_id: khaltiTransactionId } = khaltiResponse.data;

    // Find and update payment
    const payment = await Payment.findOne({ pidx }).populate("booking");
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Update payment status
    payment.status = khaltiStatus === "Completed" ? "completed" :
                     khaltiStatus === "Pending" ? "pending" :
                     khaltiStatus === "User canceled" ? "cancelled" : "failed";
    
    if (khaltiTransactionId) {
      payment.transaction_id = khaltiTransactionId;
      payment.tidx = khaltiTransactionId;
    }
    
    if (khaltiStatus === "Completed") {
      payment.paymentCompletedAt = new Date();
      // Update booking status
      const booking = await Booking.findById(payment.booking);
      if (booking && booking.status === "pending") {
        booking.status = "confirmed";
        await booking.save();
      }
    }

    await payment.save();

    // Return success response (this will be rendered to user)
    res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      status: payment.status,
      pidx,
      transaction_id: khaltiTransactionId,
      bookingId: payment.booking._id
    });

  } catch (error) {
    console.error("Payment Callback Error:", error.response?.data || error.message);
    
    res.status(400).json({
      success: false,
      message: "Error processing payment callback",
      pidx,
      error: error.message
    });
  }
});

// @desc    Get payment by booking ID
// @route   GET /api/payments/booking/:bookingId
// @access  Private
exports.getPaymentByBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user._id;

  const payment = await Payment.findOne({ booking: bookingId });
  
  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  // Verify ownership
  if (payment.user.toString() !== userId.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  res.status(200).json({
    success: true,
    payment
  });
});

// @desc    Get user payments
// @route   GET /api/payments/my
// @access  Private
exports.getUserPayments = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { status } = req.query;

  let query = { user: userId };
  if (status) {
    query.status = status;
  }

  const payments = await Payment.find(query)
    .populate("booking")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: payments.length,
    payments
  });
});

// @desc    Cancel payment
// @route   POST /api/payments/:paymentId/cancel
// @access  Private
exports.cancelPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const userId = req.user._id;

  const payment = await Payment.findById(paymentId);
  
  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  if (payment.user.toString() !== userId.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  if (payment.status === "completed") {
    return res.status(400).json({ message: "Cannot cancel a completed payment" });
  }

  payment.status = "cancelled";
  await payment.save();

  res.status(200).json({
    success: true,
    message: "Payment cancelled successfully",
    payment
  });
});
