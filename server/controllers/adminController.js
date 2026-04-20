const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const asyncHandler = require("express-async-handler");

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role === "admin") {
      res.status(400);
      throw new Error("Cannot delete admin user");
    }
    await user.deleteOne();
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update booking details/status
// @route   PUT /api/admin/bookings/:id
// @access  Private/Admin
exports.updateBooking = asyncHandler(async (req, res) => {
  const { startDate, endDate, status } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (startDate) booking.startDate = startDate;
  if (endDate) booking.endDate = endDate;
  if (status) booking.status = status;

  await booking.save();

  res.json(booking);
});

// @desc    Update vehicle status (e.g., available, unavailable)
// @route   PUT /api/admin/vehicles/:id/status
// @access  Private/Admin
exports.updateVehicleStatus = asyncHandler(async (req, res) => {
  const { status } = req.body; // Assuming status can be 'available', 'unavailable', etc.

  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error("Vehicle not found");
  }

  vehicle.status = status; // Add a 'status' field to your Vehicle model if not present
  await vehicle.save();

  res.json(vehicle);
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role === "admin" && role !== "admin") {
    res.status(400);
    throw new Error("Cannot change superadmin role");
  }

  user.role = role;
  await user.save();

  res.json(user);
});

// @desc    Get all vehicles
// @route   GET /api/admin/vehicles
// @access  Private/Admin
exports.getAllVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({}).populate("owner", "name email");
  res.json(vehicles);
});

// @desc    Delete vehicle
// @route   DELETE /api/admin/vehicles/:id
// @access  Private/Admin
exports.deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (vehicle) {
    await vehicle.deleteOne();
    res.json({ message: "Vehicle removed" });
  } else {
    res.status(404);
    throw new Error("Vehicle not found");
  }
});

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({})
    .populate("user", "name email")
    .populate({
      path: "vehicle",
      select: "title pricePerDay owner",
      populate: {
        path: "owner",
        select: "name email"
      }
    });
  res.json(bookings);
});

// @desc    Delete booking
// @route   DELETE /api/admin/bookings/:id
// @access  Private/Admin
exports.deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (booking) {
    await booking.deleteOne();
    res.json({ message: "Booking removed" });
  } else {
    res.status(404);
    throw new Error("Booking not found");
  }
});

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private/Admin
exports.getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({})
    .populate("user", "name email")
    .populate("booking", "startDate endDate status")
    .sort({ createdAt: -1 });
  res.json(payments);
});

// @desc    Update payment status (for refunds, etc)
// @route   PUT /api/admin/payments/:id
// @access  Private/Admin
exports.updatePaymentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    res.status(404);
    throw new Error("Payment not found");
  }

  payment.status = status;
  await payment.save();

  res.json(payment);
});

// @desc    Get dashboard statistics
// @route   GET /api/admin/statistics
// @access  Private/Admin
exports.getStatistics = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalVehicles = await Vehicle.countDocuments();
  const totalBookings = await Booking.countDocuments();
  
  const completedPayments = await Payment.find({ status: "completed" });
  const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);

  const pendingBookings = await Booking.countDocuments({ status: "pending" });
  const confirmedBookings = await Booking.countDocuments({ status: "confirmed" });
  const cancelledBookings = await Booking.countDocuments({ status: "cancelled" });

  res.json({
    totalUsers,
    totalVehicles,
    totalBookings,
    totalRevenue,
    pendingBookings,
    confirmedBookings,
    cancelledBookings,
    bookingStats: {
      pending: pendingBookings,
      confirmed: confirmedBookings,
      cancelled: cancelledBookings
    }
  });
});

