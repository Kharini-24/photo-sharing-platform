const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const Photo = require("../models/Photo");
const Event = require("../models/Event");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Multer keeps uploaded files in memory temporarily.
// The files are then uploaded to Cloudinary.
const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  },
});

// Upload a file buffer to Cloudinary
function uploadToCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "photo-sharing-app",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    stream.end(fileBuffer);
  });
}

// POST /api/photos/:eventId
// Team Member or Admin uploads a photo
router.post(
  "/:eventId",
  protect,
  upload.single("photo"),
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.eventId);

      if (!event) {
        return res.status(404).json({
          message: "Event not found.",
        });
      }

      // Check whether the user owns or belongs to this event
      const isCreator =
        event.createdBy.toString() === req.user.id;

      const isMember = event.members.some(
        (memberId) => memberId.toString() === req.user.id
      );

      if (!isCreator && !isMember) {
        return res.status(403).json({
          message: "You are not part of this event.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "No photo file received.",
        });
      }

      // Upload to Cloudinary
      let result;

      try {
        result = await uploadToCloudinary(req.file.buffer);
      } catch (uploadErr) {
        return res.status(502).json({
          message:
            "Photo upload to cloud storage failed. Please try again.",
        });
      }

      // Store only metadata in MongoDB
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
      // Multer file-size validation
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            message: "Photo is too large. Maximum size is 10 MB.",
          });
        }

        return res.status(400).json({
          message: "Photo upload failed.",
        });
      }

      // File type validation
      if (err.message === "Only image files are allowed.") {
        return res.status(400).json({
          message: "Only image files are allowed.",
        });
      }

      res.status(500).json({
        message: "Error uploading photo.",
        error: err.message,
      });
    }
  }
);

// GET /api/photos/:eventId
// Admin sees all event photos.
// Team Member sees only their own photos.
router.get("/:eventId", protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    const isCreator =
      event.createdBy.toString() === req.user.id;

    const isMember = event.members.some(
      (memberId) => memberId.toString() === req.user.id
    );

    // IMPORTANT SECURITY CHECK
    // A user must actually belong to this event.
    if (!isCreator && !isMember) {
      return res.status(403).json({
        message: "You do not have access to this event's photos.",
      });
    }

    const filter = {
      event: event._id,
    };

    // Team Members only see their own uploads
    if (!isCreator) {
      filter.uploadedBy = req.user.id;
    }

    const photos = await Photo.find(filter).sort({
      createdAt: -1,
    });

    res.json(photos);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching photos.",
      error: err.message,
    });
  }
});

module.exports = router;