const express = require("express");
const User = require("../models/User");
const Profile = require("../models/Profile");
const UserSearch = require("../models/UserSearch");
const verifyFirebaseToken = require("../auth/verifyFirebaseToken");
const router = express.Router();

// Helper function to calculate age
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

// ✅ POST /api/users/login
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

    const user = await User.findOneAndUpdate(filter, update, options)
      .select("uid name email photo profileCompleted")
      .lean();

    const profile = await Profile.findOne({ uid }).select("_id").lean();

    return res.json({
      message: "User logged in successfully",
      user,
      profileCompleted: !!profile,
    });
  } catch (error) {
    if (error && error.code === 11000) {
      try {
        const { uid, email } = req.user;
        const existing = await User.findOne({ $or: [{ uid }, { email }] });
        if (existing)
          return res.json({
            message: "User logged in successfully",
            user: existing,
          });
      } catch (_) {}
    }
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

// ✅ POST /api/users/searches - record a search result click
router.post("/searches", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const {
      query,
      recipeId,
      recipeTitle,
      image,
      description,
      ingredients,
      cookTime,
      steps,
    } = req.body || {};
    if (!query) return res.status(400).json({ error: "query is required" });

    const created = await UserSearch.create({
      uid,
      query,
      recipeId,
      recipeTitle,
      image,
      description,
      ingredients,
      cookTime,
      steps,
      isFavorite: false,
    });
    return res.status(201).json({ search: created });
  } catch (error) {
    console.error("Record search error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

// ✅ GET /api/users/searches/recent
router.get("/searches/recent", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const items = await UserSearch.find({ uid })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    return res.json({ searches: items });
  } catch (error) {
    console.error("Recent searches error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

// ✅ POST /api/users/searches/:id/favorite
router.post("/searches/:id/favorite", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;
    const updated = await UserSearch.findOneAndUpdate(
      { _id: id, uid },
      { $set: { isFavorite: true } },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json({ search: updated });
  } catch (error) {
    console.error("Favorite search error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

// ✅ POST /api/users/searches/:id/unfavorite
router.post(
  "/searches/:id/unfavorite",
  verifyFirebaseToken,
  async (req, res) => {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      const updated = await UserSearch.findOneAndUpdate(
        { _id: id, uid },
        { $set: { isFavorite: false } },
        { new: true }
      ).lean();
      if (!updated) return res.status(404).json({ error: "Not found" });
      return res.json({ search: updated });
    } catch (error) {
      console.error("Unfavorite search error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

// ✅ GET /api/users/me
router.get("/me", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const user = await User.findOne({ uid })
      .select("uid name email photo profileCompleted")
      .lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const profile = await Profile.findOne({ uid })
      .select(
        "uid phone dob gender weight height bmi bloodGroup medicalHistory dailyCalories goalStatus notificationsEnabled privacy"
      )
      .lean();

    const age = calculateAgeFromDob(profile?.dob);
    const profileResponse = profile ? { ...profile, age } : null;

    return res.json({ user, profile: profileResponse, profileCompleted: !!profile });
  } catch (error) {
    console.error("Fetch me error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

// ✅ PUT /api/users/profile
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
      notificationsEnabled,
      privacy,
    } = req.body;

    if (weight && (isNaN(weight) || weight < 0 || weight > 500)) {
      return res
        .status(400)
        .json({ error: "Weight must be a valid number (0-500)" });
    }
    if (height && (isNaN(height) || height < 0 || height > 300)) {
      return res
        .status(400)
        .json({ error: "Height must be a valid number (0-300)" });
    }

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
          notificationsEnabled,
          privacy,
        },
      },
      { new: true, upsert: true }
    );

    await User.findOneAndUpdate(
      { uid },
      { $set: { profileCompleted: true } }
    );
    const age = calculateAgeFromDob(profile?.dob);
    const profileResponse = profile ? { ...profile.toObject(), age } : null;
    return res.json({
      message: "Profile saved",
      profile: profileResponse,
      profileCompleted: true,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

// ✅ DELETE /api/users/account
router.delete("/account", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid } = req.user;
    await Profile.deleteOne({ uid });
    await User.deleteOne({ uid });
    await UserSearch.deleteMany({ uid }); // ✅ Delete all related searches
    return res.json({ message: "Account deleted" });
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
