const express = require("express");
const router = express.Router();
const ShoppingItem = require("../models/ShoppingItem");

// GET all shopping items
router.get("/", async (req, res) => {
  try {
    const items = await ShoppingItem.find().sort({ _id: -1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch shopping items",
      error: error.message
    });
  }
});

// POST a new shopping item
router.post("/", async (req, res) => {
  try {
    const newItem = new ShoppingItem(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({
      message: "Failed to add shopping item",
      error: error.message
    });
  }
});

// PUT (update) a shopping item by ID
router.put("/:id", async (req, res) => {
  try {
    const item = await ShoppingItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({
        message: "Shopping item not found"
      });
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update shopping item",
      error: error.message
    });
  }
});

// DELETE a shopping item by ID
router.delete("/:id", async (req, res) => {
  try {
    const item = await ShoppingItem.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Shopping item not found"
      });
    }

    res.status(200).json({
      message: "Shopping item deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete shopping item",
      error: error.message
    });
  }
});

module.exports = router;
