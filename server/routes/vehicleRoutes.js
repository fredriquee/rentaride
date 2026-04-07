const express = require("express");
const router = express.Router();
const { addVehicle, getAllVehicles, deleteVehicle} = require("../controllers/vehicleController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, addVehicle); // protected
router.get("/", getAllVehicles);
router.delete("/:id", authMiddleware, deleteVehicle);

module.exports = router;

