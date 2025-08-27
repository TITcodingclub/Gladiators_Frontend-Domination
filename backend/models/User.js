const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
});

const User = mongoose.model("User", userSchema);

module.exports = User; // ✅ Correct export
