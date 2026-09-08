require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const photoRoutes = require("./routes/photos");
const galleryRoutes = require("./routes/gallery");

const app = express();

connectDB();

app.use(cors()); // allows our React frontend (different port/domain) to call this API
app.use(express.json()); // lets us read JSON request bodies

// Mounting each route file under its own path prefix
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/gallery", galleryRoutes);

app.get("/", (req, res) => {
  res.send("Photo Sharing Platform API is running.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
