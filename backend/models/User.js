const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: { type: String, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  photo: String,
  age: Number,
  gender: String,
  weight: Number,
  height: Number,
  phone: String,
  bloodGroup: String,
  medicalHistory: String,
  bmi: String,
  dailyCalories: String,
  goalStatus: String,
  profileCompleted: { type: Boolean, default: false },
  profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User; // ✅ Correct export
