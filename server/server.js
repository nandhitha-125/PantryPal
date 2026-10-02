const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const groceryRoutes = require("./routes/groceryRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const shoppingRoutes = require("./routes/shoppingRoutes");
const authRoutes = require("./routes/authRoutes");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Ensure DB is connected before handling requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Middleware: check if MongoDB is connected before hitting DB-dependent routes
function dbReady(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database is currently unavailable. Please try again in a moment.",
    });
  }
  next();
}

app.use("/api/auth", dbReady, authRoutes);
app.use("/api/groceries", dbReady, groceryRoutes);
app.use("/api/recipes", recipeRoutes); // recipes may use external API, not always DB
app.use("/api/shopping", dbReady, shoppingRoutes);

app.get("/", (req, res) => {
  res.json({ message: "PantryPal API server is running!" });
});

app.get("/api/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({
    message: "PantryPal API is running!",
    database: dbStatus
  });
});

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI not set in .env — running without database.");
    return;
  }

  // Disable buffering so operations fail fast instead of waiting 10s
  mongoose.set("bufferCommands", false);

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
}

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`PantryPal server running on http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;