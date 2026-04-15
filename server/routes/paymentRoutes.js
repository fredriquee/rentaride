const express = require("express");
const router = express.Router();
const {
  initiatePayment,
  verifyPayment,
  handlePaymentCallback,
  getPaymentByBooking,
  getUserPayments,
  cancelPayment
} = require("../controllers/paymentController");
const { authMiddleware } = require("../middleware/authMiddleware");

// @route   POST /api/payments/initiate
// @desc    Initiate a payment with Khalti
// @access  Private
router.post("/initiate", authMiddleware, initiatePayment);

// @route   POST /api/payments/verify
// @desc    Verify payment status with Khalti
// @access  Private
router.post("/verify", authMiddleware, verifyPayment);

// @route   GET /api/payments/callback
// @desc    Handle Khalti callback (payment.return_url redirects here)
// @access  Public
router.get("/callback", handlePaymentCallback);

// @route   GET /api/payments/booking/:bookingId
// @desc    Get payment by booking ID
// @access  Private
router.get("/booking/:bookingId", authMiddleware, getPaymentByBooking);

// @route   GET /api/payments/my
// @desc    Get user's payments
// @access  Private
router.get("/my", authMiddleware, getUserPayments);

// @route   POST /api/payments/:paymentId/cancel
// @desc    Cancel a pending payment
// @access  Private
router.post("/:paymentId/cancel", authMiddleware, cancelPayment);

module.exports = router;
