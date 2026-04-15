const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || "renter",
    currentRole: role || "renter",
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      currentRole: user.currentRole,
      token: generateToken(user._id, user.role, user.name, user.email),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (user && (await bcrypt.compare(password, user.password))) {
    // Set currentRole based on user's role
    if (!user.currentRole) {
      user.currentRole = user.role === "admin" ? "renter" : user.role;
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      currentRole: user.currentRole,
      token: generateToken(user._id, user.role, user.name, user.email),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

const generateToken = (id, role, name, email) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign({ id, role, name, email }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Switch user role
// @route   PUT /api/auth/switch-role
// @access  Private
exports.switchRole = asyncHandler(async (req, res) => {
  const { newRole } = req.body;

  if (!["renter", "owner"].includes(newRole)) {
    res.status(400);
    throw new Error("Invalid role");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { currentRole: newRole },
    { new: true }
  ).select("-password");

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    currentRole: user.currentRole,
    message: `Switched to ${newRole} mode`,
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    res.status(400);
    throw new Error("Name is required");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name: name.trim() },
    { new: true }
  ).select("-password");

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    currentRole: user.currentRole,
    message: "Profile updated successfully",
  });
});

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Current password and new password are required");
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error("New password must be at least 6 characters");
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  res.json({
    message: "Password changed successfully",
  });
});