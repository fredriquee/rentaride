const Booking = require("../models/Booking");

// CREATE BOOKING
exports.createBooking = async (req, res) => {
  try {
    const { vehicle, startDate, endDate } = req.body;

    const existingBooking = await Booking.findOne({
      vehicle,
      $or: [
        {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate }
        }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "Vehicle already booked for selected dates"
      });
    }

    const booking = new Booking({
      user: req.user.id,
      vehicle,
      startDate,
      endDate
    });

    await booking.save();

    res.status(201).json({
      message: "Booking created successfully",
      booking
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET USER BOOKINGS ✅ CLEAN POPULATE
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: "vehicle",
        select: "title type pricePerDay location owner",
        populate: {
          path: "owner",
          select: "name email"
        }
      });

    res.json(bookings);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE BOOKING STATUS
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate("vehicle");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 🔐 ownership check
    if (booking.vehicle.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to update this booking"
      });
    }

    booking.status = status;

    await booking.save();

    res.json({
      message: `Booking ${status}`,
      booking
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};