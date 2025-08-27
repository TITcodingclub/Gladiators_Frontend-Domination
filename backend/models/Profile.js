const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true, index: true },
  phone: String,
  dob: String,
  gender: String,
  weight: Number,
  height: Number,
  bmi: String,
  bloodGroup: String,
  medicalHistory: String,
  dailyCalories: String,
  goalStatus: String,
}, { timestamps: true });

module.exports = mongoose.model("Profile", profileSchema);


