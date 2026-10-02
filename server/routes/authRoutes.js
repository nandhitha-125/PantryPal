const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, mobile, password, gender, avatarId, fitnessGoal } = req.body;

    // Validate fields
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Password criteria validation
    const hasCapital = /[A-Z]/.test(password);
    const hasMinLen = password.length >= 8;
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!hasCapital || !hasMinLen || !hasNumber || !hasSpecial) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters, 1 capital letter, 1 number, and 1 special character.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create new user with gender and avatarId
    const normalizedGender = gender && (gender === "male" || gender === "boy") ? "boy" : "girl";
    const defaultAvatar = normalizedGender === "boy" ? "male_1" : "female_1";

    const user = await User.create({
      name,
      email,
      mobile,
      password,
      gender: normalizedGender,
      avatarId: avatarId || defaultAvatar,
      fitnessGoal: fitnessGoal || "protein",
    });

    res.status(201).json({
      message: "Account created successfully",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        gender: user.gender,
        avatarId: user.avatarId,
        fitnessGoal: user.fitnessGoal,
      },
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        gender: user.gender || "girl",
        avatarId: user.avatarId || (user.gender === "boy" ? "male_1" : "female_1"),
        fitnessGoal: user.fitnessGoal || "protein",
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error during login" });
  }
});

// GET /api/auth/me — get current user from token
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

// PUT /api/auth/profile — update current user profile (gender, avatarId, fitnessGoal, name)
router.put("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { name, gender, avatarId, fitnessGoal } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (gender) updates.gender = gender;
    if (avatarId) updates.avatarId = avatarId;
    if (fitnessGoal) updates.fitnessGoal = fitnessGoal;

    const user = await User.findByIdAndUpdate(decoded.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Profile update error:", error.message);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

module.exports = router;
