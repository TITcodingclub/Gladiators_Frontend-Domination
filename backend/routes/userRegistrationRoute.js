const express = require("express");
const router = express.Router();
const User = require("../models/User");
const admin = require("firebase-admin");

// Middleware: Verify Firebase Token
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token", error });
  }
};

// POST /api/users/register
router.post("/register", verifyFirebaseToken, async (req, res) => {
  try {
    const { name, email, photo, age, gender, weight, height, phone, bloodGroup, medicalHistory } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and Email are required" });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Calculate BMI (optional)
    let bmi = "";
    if (weight && height) {
      const heightInMeters = height / 100;
      bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    }

    // Default daily calories & goal
    const dailyCalories = "1800 kcal";
    const goalStatus = "On Track";

    // Create user
    user = await User.create({
      name,
      email,
      photo,
      age,
      gender,
      weight,
      height,
      phone,
      bloodGroup,
      medicalHistory,
      bmi,
      dailyCalories,
      goalStatus,
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
