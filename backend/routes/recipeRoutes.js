const express = require("express");
const Recipe = require("../models/Recipe");
const verifyFirebaseToken = require("../auth/verifyFirebaseToken");
const router = express.Router();

// GET all recipes
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

// POST a new recipe
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    const recipe = await Recipe.create(req.body);
    res.status(201).json(recipe);
  } catch (err) {
    res.status(400).json({ error: "Failed to create recipe" });
  }
});

module.exports = router;
