const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const Photo = require("../models/Photo");
const Event = require("../models/Event");
const { protect } = require("../middleware/auth");

const router = express.Router();

// multer handles the file coming from the browser; we keep it in memory
// briefly, then hand it off to Cloudinary (we never save it to our own disk).
const upload = multer({ storage: multer.memoryStorage() });

// Small helper: uploads a file buffer to Cloudinary and returns the result
function uploadToCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "photo-sharing-app" },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(fileBuffer);
  });
}

// POST /api/photos/:eventId -- Team Member (or Admin) uploads a photo
router.post("/:eventId", protect, upload.single("photo"), async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found." });

    const isCreator = event.createdBy.toString() === req.user.id;
    const isMember = event.members.some((m) => m.toString() === req.user.id);
    if (!isCreator && !isMember) {
      return res.status(403).json({ message: "You are not part of this event." });
    }

    if (!req.file) return res.status(400).json({ message: "No photo file received." });

    // Handles "a failed photo upload" from the requirement doc's edge cases
    let result;
    try {
      result = await uploadToCloudinary(req.file.buffer);
    } catch (uploadErr) {
      return res.status(502).json({ message: "Photo upload to cloud storage failed. Please try again." });
    }

    const photo = await Photo.create({
      event: event._id,
      uploadedBy: req.user.id,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      filename: req.file.originalname,
      fileSize: req.file.size,
    });

    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ message: "Error uploading photo.", error: err.message });
  }
});

// GET /api/photos/:eventId -- view all photos for an event (Admin sees all,
// Team Member sees only their own uploads -- per the requirement doc)
router.get("/:eventId", protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found." });

    const isCreator = event.createdBy.toString() === req.user.id;
    const filter = { event: event._id };

    if (!isCreator) {
      filter.uploadedBy = req.user.id; // Team Members only see their own uploads
    }

    const photos = await Photo.find(filter).sort({ createdAt: -1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ message: "Error fetching photos.", error: err.message });
  }
});

module.exports = router;
