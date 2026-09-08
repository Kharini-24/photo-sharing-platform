const mongoose = require("mongoose");

// A Gallery is the PUBLISHED, customer-facing version of selected photos.
// It has its own PIN and shareable slug (used in the URL) -- customers
// never see the admin/team side of the app at all.
const gallerySchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    pin: { type: String, required: true }, // 6-digit code, stored as string to keep leading zeros
    shareSlug: { type: String, required: true, unique: true }, // e.g. "abc123" in /gallery/abc123
    photos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Photo" }], // only the SELECTED photos
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gallery", gallerySchema);
