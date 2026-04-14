const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const asyncHandler = require("express-async-handler");

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = asyncHandler(async (req, res) => {
  const { vehicle: vehicleId, startDate, endDate } = req.body;

  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    res.status(404);
    throw new Error("Vehicle not found");
  }

  // Prevent booking own vehicle
  if (vehicle.owner.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error("You cannot book a vehicle you own. Please switch to Renter mode to book other vehicles.");
  }

  // Check if vehicle is available
  if (vehicle.status !== "available") {
    res.status(400);
    throw new Error(`Vehicle is currently ${vehicle.status} and cannot be booked`);
  }

  const existingBooking = await Booking.findOne({
    vehicle: vehicleId,
    status: { $ne: "cancelled" },
    $or: [
      {
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) },
      },
    ],
  });

  if (existingBooking) {
    res.status(400);
    throw new Error("Vehicle already booked for selected dates");
  }

  const booking = await Booking.create({
    user: req.user._id,
    vehicle: vehicleId,
    startDate,
    endDate,
  });

  res.status(201).json(booking);
});

// @desc    Get user bookings
// @route   GET /api/bookings/my
// @access  Private
exports.getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate({
    path: "vehicle",
    select: "title type pricePerDay location owner image",
    populate: {
      path: "owner",
      select: "name email",
    },
  });

  res.json(bookings);
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private/Owner
exports.updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const booking = await Booking.findById(req.params.id).populate("vehicle");

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  // Check if user is the owner of the vehicle
  if (booking.vehicle.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this booking");
  }

  // Handle status transitions
  if (status === "confirmed") {
    if (booking.status === "pending" || booking.status === "cancellation_requested") {
      booking.status = "confirmed";
      booking.cancellationReason = undefined; // Clear reason if confirmed after request
    } else {
      res.status(400);
      throw new Error(`Cannot confirm a booking that is ${booking.status}`);
    }
  } else if (status === "cancelled") {
    if (booking.status === "pending" || booking.status === "cancellation_requested" || booking.status === "confirmed") {
      booking.status = "cancelled";
    } else {
      res.status(400);
      throw new Error(`Cannot cancel a booking that is ${booking.status}`);
    }
  } else if (status === "completed") {
    if (booking.status === "confirmed" && new Date(booking.endDate) < new Date()) {
      booking.status = "completed";
    } else {
      res.status(400);
      throw new Error("Booking can only be completed after its end date and if it's confirmed");
    }
  } else {
    res.status(400);
    throw new Error("Invalid status update");
  }

  await booking.save();

  res.json(booking);
});

// @desc    Get owner bookings
// @route   GET /api/bookings/owner
// @access  Private/Owner
exports.getOwnerBookings = asyncHandler(async (req, res) => {
  // Find all vehicles owned by this user
  const vehicles = await Vehicle.find({ owner: req.user._id });
  const vehicleIds = vehicles.map((v) => v._id);

  // Find all bookings for these vehicles
  const bookings = await Booking.find({ vehicle: { $in: vehicleIds } })
    .populate("user", "name email")
    .populate("vehicle", "title pricePerDay type image location");

  res.json(bookings);
});

// @desc    Get count of pending/cancellation_requested bookings for owner
// @route   GET /api/bookings/owner/notifications
// @access  Private/Owner
exports.getOwnerNotifications = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ owner: req.user._id });
  const vehicleIds = vehicles.map((v) => v._id);

  const notificationCount = await Booking.countDocuments({
    vehicle: { $in: vehicleIds },
    status: { $in: ["pending", "cancellation_requested"] },
  });

  res.json({ count: notificationCount });
});

// @desc    Request cancellation for a booking
// @route   PUT /api/bookings/:id/request-cancellation
// @access  Private
exports.requestCancellation = asyncHandler(async (req, res) => {
  const { cancellationReason } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to request cancellation for this booking");
  }

  if (booking.status === "cancelled" || booking.status === "completed") {
    res.status(400);
    throw new Error(`Booking is already ${booking.status}`);
  }

  booking.status = "cancellation_requested";
  booking.cancellationReason = cancellationReason;
  await booking.save();

  res.json(booking);
});