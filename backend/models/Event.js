const mongoose = require("mongoose");

// An Event belongs to one Admin, and has a list of Team Members (Users) on it.
// Example: "Arjun & Priya Wedding"
const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
