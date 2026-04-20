const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  updateUserRole,
  getAllVehicles,
  deleteVehicle,
  updateVehicleStatus,
  getAllBookings,
  deleteBooking,
  updateBooking,
  getAllPayments,
  updatePaymentStatus,
  getStatistics,
} = require("../controllers/adminController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

// Apply middleware to all routes in this file
router.use(authMiddleware, adminMiddleware);

// Statistics route
router.route("/statistics").get(getStatistics);

// User routes
router.route("/users").get(getAllUsers);
router.route("/users/:id")
  .delete(deleteUser)
  .put(updateUserRole); // For updating user roles

// Vehicle routes
router.route("/vehicles").get(getAllVehicles);
router.route("/vehicles/:id")
  .delete(deleteVehicle)
  .put(updateVehicleStatus); // For updating vehicle status

// Booking routes
router.route("/bookings").get(getAllBookings);
router.route("/bookings/:id")
  .delete(deleteBooking)
  .put(updateBooking); // For updating booking details/status

// Payment routes
router.route("/payments").get(getAllPayments);
router.route("/payments/:id").put(updatePaymentStatus);

module.exports = router;
