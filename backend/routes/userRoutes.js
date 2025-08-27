const express = require("express");
const admin = require("../firebaseAdmin");
const User = require("../models/User");
const router = express.Router();

// Middleware to verify Firebase ID Token
async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
}

// POST /api/users/login
router.post("/login", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid, email, name, picture } = req.firebaseUser;

    if (!email) return res.status(400).json({ error: "Email is required" });

    let user = await User.findOne({ uid });

    if (!user) {
      user = await User.create({
        uid,
        email,
        displayName: name || "",
        photoURL: picture || "",
      });
      console.log(`✅ New user created: ${email}`);
    }

    return res.json({ message: "User logged in successfully", user });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
