const mongoose = require("mongoose");

const grocerySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    unit: {
        type: String,
        required: true
    },

    expiryDate: {
        type: Date,
        required: true
    }
});

const Grocery = mongoose.model("Grocery", grocerySchema);

module.exports = Grocery;