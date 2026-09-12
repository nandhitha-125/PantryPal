const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const groceryRoutes = require("./routes/groceryRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const shoppingRoutes = require("./routes/shoppingRoutes");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/groceries", groceryRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/shopping", shoppingRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    message: "PantryPal API is running!"
  });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`PantryPal server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });