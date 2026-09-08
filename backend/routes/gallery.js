const express = require("express");
const { nanoid } = require("nanoid");
const Gallery = require("../models/Gallery");
const Event = require("../models/Event");
const Photo = require("../models/Photo");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// Generates a random 6-digit PIN, e.g. "482917"
function generatePin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/gallery/:eventId/publish -- Admin selects photos and publishes
router.post("/:eventId/publish", protect, adminOnly, async (req, res) => {
  try {
    const { photoIds } = req.body; // array of Photo _ids the admin selected
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found." });

    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You do not own this event." });
    }

    if (!photoIds || photoIds.length === 0) {
      return res.status(400).json({ message: "Select at least one photo to publish." });
    }

    // Confirm the selected photos actually belong to this event
    const validPhotos = await Photo.find({ _id: { $in: photoIds }, event: event._id });
    if (validPhotos.length === 0) {
      return res.status(400).json({ message: "None of the selected photos belong to this event." });
    }

    const gallery = await Gallery.create({
      event: event._id,
      pin: generatePin(),
      shareSlug: nanoid(8), // short random string for the shareable URL
      photos: validPhotos.map((p) => p._id),
      isPublished: true,
    });

    res.status(201).json({
      message: "Gallery published successfully.",
      shareUrl: `/gallery/${gallery.shareSlug}`,
      pin: gallery.pin,
    });
  } catch (err) {
    res.status(500).json({ message: "Error publishing gallery.", error: err.message });
  }
});

// POST /api/gallery/:slug/access -- PUBLIC route (no login) --
// customer submits the PIN to view the gallery.
router.post("/:slug/access", async (req, res) => {
  try {
    const { pin } = req.body;
    const gallery = await Gallery.findOne({ shareSlug: req.params.slug }).populate("photos");

    // Handles "attempted access to unpublished photos" and unknown links
    if (!gallery || !gallery.isPublished) {
      return res.status(404).json({ message: "Gallery not found or not published." });
    }

    // Handles "an incorrect gallery PIN"
    if (gallery.pin !== pin) {
      return res.status(401).json({ message: "Incorrect PIN. Please try again." });
    }

    res.json({
      eventId: gallery.event,
      photos: gallery.photos.map((p) => ({ url: p.imageUrl, filename: p.filename })),
    });
  } catch (err) {
    res.status(500).json({ message: "Error accessing gallery.", error: err.message });
  }
});

module.exports = router;
