const Vehicle = require("../models/Vehicle");

//ADD Vehicle
exports.addVehicle = async (req, res) => {
  try {
    const { title, type, pricePerDay, location, image } = req.body;

    const vehicle = new Vehicle({
      title,
      type,
      pricePerDay,
      location,
      image,
      owner: req.user.id // 🔥 from token
    });

    await vehicle.save();

    res.status(201).json({ message: "Vehicle added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Get all vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate("owner", "name email");
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//DELETE VEHICLES
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    if (vehicle.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to delete this vehicle" });
    }
    await vehicle.deleteOne();
    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};