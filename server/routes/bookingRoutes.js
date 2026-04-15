const express = require("express");
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getOwnerBookings,
  updateBookingStatus,
  requestCancellation,
  getOwnerNotifications,
} = require("../controllers/bookingController");
const { authMiddleware, ownerMiddleware } = require("../middleware/authMiddleware");
const { validateBooking, handleValidationErrors } = require("../middleware/validationMiddleware");

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post("/", authMiddleware, validateBooking, handleValidationErrors, createBooking);

// @route   GET /api/bookings/my
// @desc    Get user bookings
// @access  Private
router.get("/my", authMiddleware, getUserBookings);

// @route   GET /api/bookings/owner
// @desc    Get owner bookings
// @access  Private/Owner
router.get("/owner", authMiddleware, ownerMiddleware, getOwnerBookings);

// @route   GET /api/bookings/owner/notifications
// @desc    Get count of pending/cancellation_requested bookings for owner
// @access  Private/Owner
router.get("/owner/notifications", authMiddleware, ownerMiddleware, getOwnerNotifications);

// @route   PUT /api/bookings/:id
// @desc    Update booking status
// @access  Private/Owner
router.put("/:id", authMiddleware, ownerMiddleware, updateBookingStatus);

// @route   PUT /api/bookings/:id/request-cancellation
// @desc    Request cancellation for a booking
// @access  Private
router.put("/:id/request-cancellation", authMiddleware, requestCancellation);

module.exports = router;