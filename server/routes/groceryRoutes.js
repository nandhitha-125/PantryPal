const express = require("express");
const router = express.Router();
const Grocery = require("../models/Grocery");
const authenticate = require("../middleware/authenticate");

// All routes require authentication
router.use(authenticate);

// GET all groceries for the authenticated user
router.get("/", async (req, res) => {
  try {
    const groceries = await Grocery.find({ userId: req.userId });
    res.status(200).json(groceries);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch groceries",
      error: error.message
    });
  }
});

// POST a new grocery item for the authenticated user
router.post("/", async (req, res) => {
  try {
    const newGrocery = new Grocery({ ...req.body, userId: req.userId });
    const savedGrocery = await newGrocery.save();
    res.status(201).json(savedGrocery);
  } catch (error) {
    res.status(400).json({
      message: "Failed to add grocery",
      error: error.message
    });
  }
});

// PUT (update) a grocery item by ID — only if owned by the authenticated user
router.put("/:id", async (req, res) => {
  try {
    const grocery = await Grocery.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
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

// DELETE a grocery item by ID — only if owned by the authenticated user
router.delete("/:id", async (req, res) => {
  try {
    const grocery = await Grocery.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

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