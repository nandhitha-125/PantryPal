const mongoose = require("mongoose");

const shoppingItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: false
  },
  completed: {
    type: Boolean,
    default: false
  }
});

const ShoppingItem = mongoose.model("ShoppingItem", shoppingItemSchema);

module.exports = ShoppingItem;
