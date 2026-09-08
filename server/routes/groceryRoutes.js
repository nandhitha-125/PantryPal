const express = require("express");
const router = express.Router();
const Grocery = require("../models/Grocery");

// GET all groceries
router.get("/", async (req, res) => {
  try {
    const groceries = await Grocery.find();
    res.status(200).json(groceries);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch groceries",
      error: error.message
    });
  }
});

// POST a new grocery item
router.post("/", async (req, res) => {
  try {
    const newGrocery = new Grocery(req.body);
    const savedGrocery = await newGrocery.save();
    res.status(201).json(savedGrocery);
  } catch (error) {
    res.status(400).json({
      message: "Failed to add grocery",
      error: error.message
    });
  }
});

// PUT (update) a grocery item by ID
router.put("/:id", async (req, res) => {
  try {
    const grocery = await Grocery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!grocery) {
      return res.status(404).json({
        message: "Grocery not found"
      });
    }

    res.status(200).json(grocery);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update grocery",
      error: error.message
    });
  }
});

// DELETE a grocery item by ID
router.delete("/:id", async (req, res) => {
  try {
    const grocery = await Grocery.findByIdAndDelete(req.params.id);

    if (!grocery) {
      return res.status(404).json({
        message: "Grocery not found"
      });
    }

    res.status(200).json({
      message: "Grocery deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete grocery",
      error: error.message
    });
  }
});

module.exports = router;