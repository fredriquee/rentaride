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

const { authMiddleware, ownerMiddleware } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Get all vehicles (public)
router.get("/", getAllVehicles);

// Get vehicles by specific user (public)
router.get("/user/:userId", getVehiclesByUserId);

// Get owner's vehicles (private, owner only)
router.get("/owner/myVehicles", authMiddleware, ownerMiddleware, getOwnerVehicles);

// Get specific vehicle by ID (public)
router.get("/:id", getVehicleById);

// Create new vehicle (private, owner only)
router.post(
  "/",
  authMiddleware,
  ownerMiddleware,
  upload.array("images", 1),
  addVehicle
);

// Update vehicle (private, owner only)
router.put(
  "/:id",
  authMiddleware,
  ownerMiddleware,
  upload.array("images", 1),
  updateVehicle
);

// Delete vehicle image (private, owner only)
router.delete("/:id/image", authMiddleware, ownerMiddleware, deleteVehicleImage);

// Delete vehicle (private, owner only)
router.delete("/:id", authMiddleware, ownerMiddleware, deleteVehicle);

module.exports = router;