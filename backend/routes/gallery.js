const express = require("express");
const crypto = require("crypto");
const { nanoid } = require("nanoid");

const Gallery = require("../models/Gallery");
const Event = require("../models/Event");
const Photo = require("../models/Photo");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// Generates a cryptographically secure 6-digit PIN
function generatePin() {
  return crypto.randomInt(100000, 1000000).toString();
}

// POST /api/gallery/:eventId/publish
// Admin selects photos and publishes a gallery
router.post("/:eventId/publish", protect, adminOnly, async (req, res) => {
  try {
    const { photoIds } = req.body;

    if (!Array.isArray(photoIds) || photoIds.length === 0) {
      return res.status(400).json({
        message: "Select at least one photo to publish.",
      });
    }

    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    // Only the Admin who created the event can publish it
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You do not own this event.",
      });
    }

    // Make sure all selected photos belong to this event
    const validPhotos = await Photo.find({
      _id: { $in: photoIds },
      event: event._id,
    });

    // IMPORTANT:
    // The number of valid photos must match the number selected.
    if (validPhotos.length !== photoIds.length) {
      return res.status(400).json({
        message: "One or more selected photos do not belong to this event.",
      });
    }

    const gallery = await Gallery.create({
      event: event._id,
      pin: generatePin(),
      shareSlug: nanoid(8),
      photos: validPhotos.map((photo) => photo._id),
      isPublished: true,
    });

    res.status(201).json({
      message: "Gallery published successfully.",
      shareUrl: `/gallery/${gallery.shareSlug}`,
      pin: gallery.pin,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error publishing gallery.",
      error: err.message,
    });
  }
});

// POST /api/gallery/:slug/access
// PUBLIC customer gallery access
router.post("/:slug/access", async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin || !/^\d{6}$/.test(pin)) {
      return res.status(400).json({
        message: "Please enter a valid 6-digit PIN.",
      });
    }

    const gallery = await Gallery.findOne({
      shareSlug: req.params.slug,
      isPublished: true,
    }).populate("photos");

    if (!gallery) {
      return res.status(404).json({
        message: "Gallery not found or not published.",
      });
    }

    // Check PIN
    if (gallery.pin !== pin) {
      return res.status(401).json({
        message: "Incorrect PIN. Please try again.",
      });
    }

    // Return ONLY the photos selected for this gallery
    res.json({
      eventId: gallery.event,
      photos: gallery.photos.map((photo) => ({
        url: photo.imageUrl,
        filename: photo.filename,
      })),
    });
  } catch (err) {
    res.status(500).json({
      message: "Error accessing gallery.",
      error: err.message,
    });
  }
});

module.exports = router;