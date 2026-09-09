const express = require("express");
const Event = require("../models/Event");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// POST /api/events
// Admin creates a new event
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Event name is required.",
      });
    }

    const event = await Event.create({
      name,
      createdBy: req.user.id,
      members: [],
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({
      message: "Error creating event.",
      error: err.message,
    });
  }
});

// POST /api/events/:eventId/members
// Admin adds a team member by email
router.post("/:eventId/members", protect, adminOnly, async (req, res) => {
  try {
    const { email } = req.body;

    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    // Security: Admin can manage members only for their own event
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You do not own this event.",
      });
    }

    const member = await User.findOne({ email });

    if (!member) {
      return res.status(404).json({
        message: "No user found with that email.",
      });
    }

    // Avoid adding the same member twice
    if (!event.members.includes(member._id)) {
      event.members.push(member._id);
      await event.save();
    }

    res.json({
      message: "Member added.",
      event,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error adding member.",
      error: err.message,
    });
  }
});

// GET /api/events
// Admin sees events they created.
// Team Members see events assigned to them.
router.get("/", protect, async (req, res) => {
  try {
    const events =
      req.user.role === "admin"
        ? await Event.find({ createdBy: req.user.id })
        : await Event.find({ members: req.user.id });

    res.json(events);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching events.",
      error: err.message,
    });
  }
});

// GET /api/events/:eventId
// Get one event after checking user access.
router.get("/:eventId", protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).populate(
      "members",
      "name email"
    );

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    const isCreator =
      event.createdBy.toString() === req.user.id;

    const isMember = event.members.some(
      (m) => m._id.toString() === req.user.id
    );

    if (!isCreator && !isMember) {
      return res.status(403).json({
        message: "You do not have access to this event.",
      });
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching event.",
      error: err.message,
    });
  }
});

module.exports = router;