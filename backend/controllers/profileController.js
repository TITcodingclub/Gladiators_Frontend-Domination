const User = require('../models/User');
const Profile = require('../models/Profile');
const UserSearch = require('../models/UserSearch');

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

// Update user profile
exports.updateProfile = async (req, res) => {
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
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const { uid } = req.user;
    await Profile.deleteOne({ uid });
    await User.deleteOne({ uid });
    await UserSearch.deleteMany({ uid }); // Delete all related searches
    return res.json({ message: "Account deleted" });
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};