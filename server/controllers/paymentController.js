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

// eSewa Configuration
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
const ESEWA_MERCHANT_ID = process.env.ESEWA_MERCHANT_ID || "EPAYTEST";
const ESEWA_SANDBOX_URL = "https://uat.esewa.com.np";
const ESEWA_PRODUCTION_URL = "https://esewa.com.np";
const ESEWA_API_URL = IS_SANDBOX ? ESEWA_SANDBOX_URL : ESEWA_PRODUCTION_URL;

// Helper function to generate unique purchase order ID
const generatePurchaseOrderId = () => {
  return `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to generate eSewa signature
const crypto = require("crypto");
const generateESewaSignature = (message, secretKey) => {
  return crypto
    .createHmac("sha256", secretKey)
    .update(message)
    .digest("base64");
};

// @desc    Initiate payment with Khalti
// @route   POST /api/payments/initiate
// @access  Private
exports.initiatePayment = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  const userId = req.user._id;

  // Check if Khalti secret key is configured
  if (!KHALTI_SECRET_KEY) {
    console.error("❌ KHALTI_SECRET_KEY is not configured in environment variables");
    return res.status(500).json({ 
      message: "Payment gateway not configured. Please contact support.",
      error: "KHALTI_SECRET_KEY missing"
    });
  }

  // Validate booking - use lean() to get plain JS object
  const booking = await Booking.findById(bookingId).populate("vehicle user").lean();
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.user._id.toString() !== userId.toString()) {
    return res.status(403).json({ message: "Unauthorized: This is not your booking" });
  }

  // Check if payment already exists and is pending/completed
  const existingPayment = await Payment.findOne({
    booking: bookingId,
    status: { $in: ["completed", "pending", "paid"] }
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
  const dailyRate = booking.vehicle.pricePerDay || 2000; // Default daily rate
  const totalAmount = days * dailyRate;

  // Amount in paisa (1 Rs = 100 paisa)
  const amountInPaisa = totalAmount * 100;

  console.log("💰 Payment Calculation:", {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    days,
    dailyRate,
    totalAmountRs: totalAmount,
    amountInPaisa,
    vehicle: `${booking.vehicle.make} ${booking.vehicle.model}`
  });

  if (amountInPaisa < 1000) {
    return res.status(400).json({ 
      message: "Minimum payment amount is Rs. 10 (1000 paisa)" 
    });
  }

  // Generate purchase order ID
  const purchaseOrderId = generatePurchaseOrderId();

  // Create Khalti payment payload
  const khaltiPayload = {
    return_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment/${bookingId}`,
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
      gateway: "khalti",
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
    await Booking.findByIdAndUpdate(bookingId, { paymentId: payment._id }, { new: true });

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
    console.error("❌ Khalti API Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      khaltiUrl: KHALTI_API_URL
    });
    
    res.status(400).json({
      message: "Failed to initiate payment",
      error: error.response?.data?.detail || error.response?.data || error.message,
      hint: "Make sure KHALTI_SECRET_KEY is set correctly in environment variables"
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

    // Update payment status - set to 'paid' if transaction is completed
    if (status === "Completed") {
      payment.status = "paid";
      payment.paymentCompletedAt = new Date();
    }
    
    if (transaction_id) {
      payment.transaction_id = transaction_id;
      payment.tidx = transaction_id;
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

    // Update payment status - set to 'paid' if transaction is completed
    if (khaltiStatus === "Completed") {
      payment.status = "paid";
      payment.paymentCompletedAt = new Date();
    }
    
    if (khaltiTransactionId) {
      payment.transaction_id = khaltiTransactionId;
      payment.tidx = khaltiTransactionId;
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

  // Only fetch active payments (not cancelled or failed)
  // Populate booking with vehicle to check ownership
  const payment = await Payment.findOne({ 
    booking: bookingId,
    status: { $in: ["initiated", "pending", "completed", "paid"] }
  }).populate({
    path: "booking",
    populate: {
      path: "vehicle",
      select: "owner"
    }
  });
  
  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  // Verify ownership - allow if user is the renter OR the vehicle owner
  const isRenter = payment.user.toString() === userId.toString();
  const isOwner = payment.booking.vehicle.owner?.toString() === userId.toString();

  if (!isRenter && !isOwner) {
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

  if (payment.status === "completed" || payment.status === "paid") {
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

// @desc    Initiate payment with eSewa
// @route   POST /api/payments/esewa/initiate
// @access  Private
exports.initiateESewaPayment = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  const userId = req.user._id;

  // Validate booking - use lean() to get plain JS object
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
    gateway: "esewa",
    status: { $in: ["completed", "pending", "paid"] }
  });

  if (existingPayment && existingPayment.status === "completed") {
    return res.status(400).json({ message: "Payment already completed for this booking" });
  }

  if (existingPayment && existingPayment.status === "pending") {
    return res.status(400).json({ 
      message: "Payment already initiated",
      paymentId: existingPayment._id
    });
  }

  // Calculate amount
  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const dailyRate = booking.vehicle.pricePerDay || 2000;
  const totalAmount = days * dailyRate;

  if (totalAmount < 10) {
    return res.status(400).json({ 
      message: "Minimum payment amount is Rs. 10" 
    });
  }

  // Generate purchase order ID and transaction code
  const purchaseOrderId = generatePurchaseOrderId();
  const transactionCode = `TXN_${Date.now()}`;

  // Create payment record in database
  const payment = await Payment.create({
    booking: bookingId,
    user: userId,
    amount: totalAmount,
    gateway: "esewa",
    status: "initiated",
    purchase_order_id: purchaseOrderId,
    purchase_order_name: `RentaRide Booking - ${booking.vehicle.model}`,
    refId: transactionCode,
    customer_info: {
      name: booking.user.name,
      email: booking.user.email,
      phone: booking.user.phone || ""
    },
    paymentInitiatedAt: new Date()
  });

  // Update booking to link with payment
  await Booking.findByIdAndUpdate(bookingId, { paymentId: payment._id }, { new: true });

  // Build eSewa payment form data
  const esewaPaymentData = {
    amt: totalAmount,
    psc: 0,
    pdc: 0,
    txAmt: 0,
    tAmt: totalAmount,
    pid: purchaseOrderId,
    scd: ESEWA_MERCHANT_ID,
    su: `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment/${bookingId}`,
    fu: `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment/${bookingId}`
  };

  // Generate signature
  const signatureMessage = `${esewaPaymentData.amt}${esewaPaymentData.psc}${esewaPaymentData.pdc}${esewaPaymentData.txAmt}${esewaPaymentData.tAmt}${esewaPaymentData.pid}${esewaPaymentData.scd}${esewaPaymentData.su}${esewaPaymentData.fu}`;
  const signature = generateESewaSignature(signatureMessage, ESEWA_SECRET_KEY);

  console.log("✅ eSewa payment initiated:", { paymentId: payment._id, amount: totalAmount });

  res.status(200).json({
    success: true,
    message: "eSewa payment initiated successfully",
    paymentId: payment._id,
    paymentData: {
      ...esewaPaymentData,
      signature
    },
    esewaUrl: `${ESEWA_API_URL}/epay/main`
  });
});

// @desc    Verify eSewa payment
// @route   POST /api/payments/esewa/verify
// @access  Private
exports.verifyESewaPayment = asyncHandler(async (req, res) => {
  const { oid, refId } = req.body;
  const userId = req.user._id;

  if (!oid || !refId) {
    return res.status(400).json({ message: "Order ID and Reference ID are required" });
  }

  // Find payment record
  const payment = await Payment.findOne({ 
    purchase_order_id: oid,
    gateway: "esewa"
  }).populate("booking");

  if (!payment) {
    return res.status(404).json({ message: "Payment record not found" });
  }

  // Verify ownership
  if (payment.user.toString() !== userId.toString()) {
    return res.status(403).json({ message: "Unauthorized: This is not your payment" });
  }

  try {
    // Verify with eSewa API
    const esewaVerifyData = `total_amount=${payment.amount}&transaction_uuid=${refId}&product_code=${ESEWA_MERCHANT_ID}&secret_key=${ESEWA_SECRET_KEY}`;
    
    const esewaResponse = await axios.get(
      `${ESEWA_API_URL}/api/epay/transaction/status/`,
      {
        params: {
          total_amount: payment.amount,
          transaction_uuid: refId,
          product_code: ESEWA_MERCHANT_ID
        }
      }
    );

    // Update payment based on response - set to 'paid' if transaction is completed
    if (esewaResponse.data.status === "COMPLETE") {
      payment.status = "paid";
      payment.transaction_id = refId;
      payment.paymentCompletedAt = new Date();
    }

    await payment.save();

    res.status(200).json({
      success: true,
      message: "eSewa payment verified",
      status: esewaResponse.data.status,
      payment: {
        id: payment._id,
        status: payment.status,
        transaction_id: payment.transaction_id,
        amount: payment.amount
      }
    });

  } catch (error) {
    console.error("eSewa Verification Error:", error.message);
    
    res.status(400).json({
      success: false,
      message: "Failed to verify eSewa payment",
      error: error.message
    });
  }
});

// @desc    Handle eSewa callback
// @route   GET /api/payments/esewa/callback
// @access  Public
exports.handleESewaCallback = asyncHandler(async (req, res) => {
  const { oid, refId, amt } = req.query;

  if (!oid || !refId) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    // Find payment
    const payment = await Payment.findOne({ 
      purchase_order_id: oid,
      gateway: "esewa"
    }).populate("booking");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Update payment - set to 'paid' when transaction is complete
    payment.status = "paid";
    payment.transaction_id = refId;
    payment.paymentCompletedAt = new Date();

    await payment.save();

    res.status(200).json({
      success: true,
      message: "eSewa payment processed successfully"
    });

  } catch (error) {
    console.error("eSewa Callback Error:", error.message);
    
    res.status(400).json({
      success: false,
      message: "Error processing eSewa callback",
      error: error.message
    });
  }
});
