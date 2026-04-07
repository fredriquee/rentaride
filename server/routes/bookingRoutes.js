const express = require("express");
const router = express.Router();

const {
  createBooking,
  getUserBookings,
  updateBookingStatus
} = require("../controllers/bookingController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createBooking);
router.get("/", authMiddleware, getUserBookings);

// ✅ THIS IS IMPORTANT
router.put("/:id", authMiddleware, updateBookingStatus);

module.exports = router;