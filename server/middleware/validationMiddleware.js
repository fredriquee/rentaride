const { body, validationResult } = require("express-validator");

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules
const validateRegister = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 })
    .withMessage("Name must not exceed 100 characters"),
  body("role")
    .optional()
    .isIn(["renter", "owner"])
    .withMessage("Invalid role"),
];

const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

const validateVehicle = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Vehicle name is required")
    .isLength({ max: 100 })
    .withMessage("Vehicle name must not exceed 100 characters"),
  body("model")
    .trim()
    .notEmpty()
    .withMessage("Model is required"),
  body("pricePerDay")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("available")
    .optional()
    .isBoolean()
    .withMessage("Available must be a boolean"),
];

const validateBooking = [
  body("vehicle")
    .isMongoId()
    .withMessage("Invalid vehicle ID"),
  body("startDate")
    .matches(/^\d{4}-\d{2}-\d{2}/)
    .withMessage("Invalid start date format"),
  body("endDate")
    .matches(/^\d{4}-\d{2}-\d{2}/)
    .withMessage("Invalid end date format"),
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateVehicle,
  validateBooking,
};
