const Vehicle = require("../models/Vehicle");
const asyncHandler = require("express-async-handler");
const { cloudinary } = require("../middleware/cloudinaryUpload");

// @desc    Add a new vehicle
// @route   POST /api/vehicles
// @access  Private/Owner
exports.addVehicle = asyncHandler(async (req, res) => {
  const { title, type, pricePerDay, location, image, fuelType } = req.body;

  console.log("Request body:", req.body);
  console.log("Request files:", req.files);

  // Validate required fields
  if (!title || !type || !pricePerDay) {
    res.status(400);
    throw new Error("Please provide all required fields: title, type, pricePerDay");
  }

  // Validate price is positive
  if (isNaN(pricePerDay) || pricePerDay <= 0) {
    res.status(400);
    throw new Error("Price per day must be a positive number");
  }

  // Get uploaded file paths from Cloudinary
  const images = req.files
    ? req.files.map((file) => file.path)
    : [];

  console.log("Processed images array:", images);

  // Handle location - can be string or JSON stringified object
  let locationValue = null;
  if (location) {
    try {
      // Try to parse if it's a JSON string
      const parsed = JSON.parse(location);
      locationValue = parsed.address || parsed;
    } catch (e) {
      // If not JSON, use as-is
      locationValue = location;
    }
  }

  const vehicle = await Vehicle.create({
    title,
    type,
    pricePerDay: parseFloat(pricePerDay),
    location: locationValue,
    fuelType: fuelType || "petrol",
    image: image || (images.length > 0 ? images[0] : null),
    images: images.length > 0 ? images : [],
    owner: req.user._id,
  });

  console.log("Vehicle created:", vehicle);
  res.status(201).json(vehicle);
});

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
exports.getAllVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find().populate("owner", "name email phone");
  res.json(vehicles);
});

// @desc    Get vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Public
exports.getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id).populate("owner", "name email phone");

  if (!vehicle) {
    res.status(404);
    throw new Error("Vehicle not found");
  }

  res.json(vehicle);
});

// @desc    Get all vehicles by owner
// @route   GET /api/vehicles/owner/myVehicles
// @access  Private/Owner
exports.getOwnerVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ owner: req.user._id });
  res.json(vehicles);
});

// @desc    Get all vehicles by a specific user (public)
// @route   GET /api/vehicles/user/:userId
// @access  Public
exports.getVehiclesByUserId = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ owner: req.params.userId }).populate("owner", "name email");
  res.json(vehicles);
});

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private/Owner
exports.updateVehicle = asyncHandler(async (req, res) => {
  const { title, type, pricePerDay, location, status, fuelType } = req.body;
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error("Vehicle not found");
  }

  // Check ownership
  if (vehicle.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this vehicle");
  }

  // Update fields (only if provided)
  if (title) vehicle.title = title;
  if (type) vehicle.type = type;
  if (pricePerDay) vehicle.pricePerDay = parseFloat(pricePerDay);
  
  // Handle location - can be string or JSON stringified object
  if (location) {
    try {
      // Try to parse if it's a JSON string
      const parsed = JSON.parse(location);
      vehicle.location = parsed.address || parsed;
    } catch (e) {
      // If not JSON, use as-is
      vehicle.location = location;
    }
  }
  
  if (status) vehicle.status = status;
  if (fuelType) vehicle.fuelType = fuelType;

  // Handle new image uploads (replace old one)
  if (req.files && req.files.length > 0) {
    // Delete old image from Cloudinary if it exists
    if (vehicle.image && vehicle.image.includes("cloudinary")) {
      try {
        // Extract public_id from Cloudinary URL
        const publicId = vehicle.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`rentaride/vehicles/${publicId}`);
      } catch (error) {
        console.error("Error deleting old image from Cloudinary:", error);
      }
    }

    // Set new image from Cloudinary
    const newImagePath = req.files[0].path;
    vehicle.image = newImagePath;
    vehicle.images = [newImagePath];
  }

  const updated = await vehicle.save();
  res.json(updated);
});

// @desc    Delete a vehicle image
// @route   DELETE /api/vehicles/:id/image
// @access  Private/Owner
exports.deleteVehicleImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error("Vehicle not found");
  }

  // Check ownership
  if (vehicle.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this image");
  }

  // Remove image from database
  if (vehicle.image === imageUrl) {
    vehicle.image = null;
  }

  if (vehicle.images && vehicle.images.includes(imageUrl)) {
    vehicle.images = vehicle.images.filter(img => img !== imageUrl);
  }

  // Delete file from Cloudinary if it's a Cloudinary URL
  if (imageUrl.includes("cloudinary")) {
    try {
      // Extract public_id from Cloudinary URL
      const publicId = imageUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`rentaride/vehicles/${publicId}`);
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
    }
  }

  const updated = await vehicle.save();
  res.json(updated);
});

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private/Owner
exports.deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error("Vehicle not found");
  }

  // Check for ownership
  if (vehicle.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this vehicle");
  }

  // Delete uploaded images from Cloudinary
  if (vehicle.images && vehicle.images.length > 0) {
    for (const imagePath of vehicle.images) {
      if (imagePath.includes("cloudinary")) {
        try {
          // Extract public_id from Cloudinary URL
          const publicId = imagePath.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`rentaride/vehicles/${publicId}`);
        } catch (error) {
          console.error("Error deleting image from Cloudinary:", error);
        }
      }
    }
  }

  await vehicle.deleteOne();
  res.json({ message: "Vehicle removed" });
});

