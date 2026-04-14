const express = require("express");
const router = express.Router();
const {
  addVehicle,
  getAllVehicles,
  getVehicleById,
  getOwnerVehicles,
  getVehiclesByUserId,
  updateVehicle,
  deleteVehicle,
  deleteVehicleImage
} = require("../controllers/vehicleController");

const { authMiddleware } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Get all vehicles (public)
router.get("/", getAllVehicles);

// Get vehicles by specific user (public)
router.get("/user/:userId", getVehiclesByUserId);

// Get owner's vehicles (private)
router.get("/owner/myVehicles", authMiddleware, getOwnerVehicles);

// Get specific vehicle by ID (public)
router.get("/:id", getVehicleById);

// Create new vehicle (private)
router.post(
  "/",
  authMiddleware,
  upload.array("images", 1),
  addVehicle
);

// Update vehicle (private)
router.put(
  "/:id",
  authMiddleware,
  upload.array("images", 1),
  updateVehicle
);

// Delete vehicle image (private)
router.delete("/:id/image", authMiddleware, deleteVehicleImage);

// Delete vehicle (private)
router.delete("/:id", authMiddleware, deleteVehicle);

module.exports = router;