const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
require("dotenv").config();

// Initialize app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json({ extended: false }));
app.use(cors());


app.use("/api/restaurants", require("./routes/restaurantRoutes"));
app.use("/health", (req, res) => {
  res.status(200).json({ status: "restaurant service UP" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Restaurant Service running on port ${PORT}`));
