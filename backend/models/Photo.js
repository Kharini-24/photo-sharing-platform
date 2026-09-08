const mongoose = require("mongoose");

// IMPORTANT CONCEPT: We do NOT store the actual image file here.
// The image file itself lives on Cloudinary (cloud storage).
// This model only stores the image's URL + metadata -- this is standard practice
// because databases are slow/expensive for large binary files like photos.
const photoSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: { type: String, required: true }, // Cloudinary URL
    publicId: { type: String, required: true }, // Cloudinary's internal file ID (needed to delete later)
    filename: { type: String },
    fileSize: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Photo", photoSchema);
