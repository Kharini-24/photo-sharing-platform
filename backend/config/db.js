const mongoose = require("mongoose");

// This function connects our app to MongoDB using the connection string
// stored in .env (never hardcode this -- it's a secret).
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1); // stop the app if we can't connect to the database
  }
}

module.exports = connectDB;
