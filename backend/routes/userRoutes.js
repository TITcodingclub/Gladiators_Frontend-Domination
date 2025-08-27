const express = require("express");
const User = require("../models/User");
const Profile = require("../models/Profile");
const verifyFirebaseToken = require("../auth/verifyFirebaseToken");
const router = express.Router();

function calculateAgeFromDob(dob) {
  if (!dob) return "";
  try {
    const birth = new Date(dob);
    if (Number.isNaN(birth.getTime())) return "";
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return String(age);
  } catch {
    return "";
  }
}

// POST /api/users/login
router.post("/login", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid, email, name, picture } = req.user;

    if (!email) return res.status(400).json({ error: "Email is required" });

    const filter = { $or: [{ uid }, { email }] };
    const update = {
      $set: {
        name: name || "Unnamed User",
        photo: picture || "",
        uid,
        email,
      },
    };
    const options = { new: true, upsert: true };

    const user = await User.findOneAndUpdate(filter, update, options);

    const profile = await Profile.findOne({ uid });

    return res.json({
      message: "User logged in successfully",
      user,
      profileCompleted: !!profile,
    });
  } catch (error) {
    // Handle rare race condition for unique indexes
    if (error && error.code === 11000) {
      try {
        const { uid, email } = req.user;
        const existing = await User.findOne({ $or: [{ uid }, { email }] });
        if (existing) return res.json({ message: "User logged in successfully", user: existing });
      } catch (_) {}
    }
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /api/users/me
router.get("/me", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: "User not found" });
    const profile = await Profile.findOne({ uid });
    const age = calculateAgeFromDob(profile?.dob);
    const profileResponse = profile ? { ...profile.toObject(), age } : null;
    return res.json({ user, profile: profileResponse, profileCompleted: !!profile });
  } catch (error) {
    console.error("Fetch me error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/users/profile - update or create profile
router.put("/profile", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const {
      phone,
      dob,
      gender,
      weight,
      height,
      bloodGroup,
      medicalHistory,
      dailyCalories,
      goalStatus,
    } = req.body;

    let bmi = "";
    if (weight && height) {
      const heightInMeters = height / 100;
      bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    }

    const profile = await Profile.findOneAndUpdate(
      { uid },
      {
        $set: {
          phone,
          dob,
          gender,
          weight,
          height,
          bmi,
          bloodGroup,
          medicalHistory,
          dailyCalories,
          goalStatus,
        },
      },
      { new: true, upsert: true }
    );

    await User.findOneAndUpdate({ uid }, { $set: { profileCompleted: true } });
    const age = calculateAgeFromDob(profile?.dob);
    const profileResponse = profile ? { ...profile.toObject(), age } : null;
    return res.json({ message: "Profile saved", profile: profileResponse, profileCompleted: true });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
