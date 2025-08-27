const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  socketId: String,
  uid: String,
  displayName: String,
  joinedAt: { type: Date, default: Date.now },
});

const roomSchema = new mongoose.Schema({
  roomID: String,
  hostSocketId: String,
  createdAt: { type: Date, default: Date.now },
  users: [userSchema],
});

module.exports = mongoose.model("Room", roomSchema);
