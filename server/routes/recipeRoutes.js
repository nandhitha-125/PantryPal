const express = require("express");
const router = express.Router();
router.get("/", async (req, res) => {
  try {
    const ingredients = req.query.ingredients;

    if (!ingredients) {
      return res.status(400).json({
        message: "Please provide ingredients"
      });
    }

    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(
      ingredients
    )}&number=10&apiKey=${process.env.SPOONACULAR_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({
        message: "Spoonacular API request failed"
      });
    }

    const recipes = await response.json();

    res.status(200).json(recipes);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch recipes"
    });
  }
});

module.exports = router;