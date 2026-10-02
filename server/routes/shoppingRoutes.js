const express = require("express");
const router = express.Router();
const ShoppingItem = require("../models/ShoppingItem");
const authenticate = require("../middleware/authenticate");

// All routes require authentication
router.use(authenticate);

// GET all shopping items for the authenticated user
router.get("/", async (req, res) => {
  try {
    const items = await ShoppingItem.find({ userId: req.userId }).sort({ _id: -1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch shopping items",
      error: error.message
    });
  }
});

// POST a new shopping item for the authenticated user
router.post("/", async (req, res) => {
  try {
    const newItem = new ShoppingItem({ ...req.body, userId: req.userId });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({
      message: "Failed to add shopping item",
      error: error.message
    });
  }
});

// PUT (update) a shopping item by ID — only if owned by the authenticated user
router.put("/:id", async (req, res) => {
  try {
    const item = await ShoppingItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
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

// DELETE a shopping item by ID — only if owned by the authenticated user
router.delete("/:id", async (req, res) => {
  try {
    const item = await ShoppingItem.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

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
