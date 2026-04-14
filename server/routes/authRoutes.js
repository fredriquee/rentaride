const express = require("express");
const router = express.Router();
const { register, login, switchRole, updateProfile, changePassword } = require("../controllers/authController");
const {
  validateRegister,
  validateLogin,
  handleValidationErrors,
} = require("../middleware/validationMiddleware");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/register", validateRegister, handleValidationErrors, register);
router.post("/login", validateLogin, handleValidationErrors, login);
router.put("/switch-role", authMiddleware, switchRole);
router.put("/update-profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;