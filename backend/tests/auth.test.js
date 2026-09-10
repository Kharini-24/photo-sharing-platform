const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Authentication", () => {
  test("should reject invalid login credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "invalid@example.com",
        password: "wrongpassword",
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Invalid email or password.");
  });
});

describe("Authorization / RBAC", () => {
  test("should prevent a team member from publishing a gallery", async () => {
    const token = jwt.sign(
      {
        id: new mongoose.Types.ObjectId().toString(),
        role: "member",
        name: "Test Member",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const response = await request(app)
      .post(`/api/gallery/${new mongoose.Types.ObjectId()}/publish`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        photoIds: [new mongoose.Types.ObjectId().toString()],
      });

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe("Only Admins can perform this action.");
  });
});
describe("Photo Access Control", () => {
    test("should prevent a user from accessing photos of an event they do not belong to", async () => {
      const Event = require("../models/Event");
  
      const event = await Event.create({
        name: "Private Event",
        createdBy: new mongoose.Types.ObjectId(),
        members: [],
      });
  
      const token = jwt.sign(
        {
          id: new mongoose.Types.ObjectId().toString(),
          role: "member",
          name: "Unauthorized Member",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      const response = await request(app)
        .get(`/api/photos/${event._id}`)
        .set("Authorization", `Bearer ${token}`);
  
      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe(
        "You do not have access to this event's photos."
      );
    });
  });
  describe("Gallery Publishing", () => {
    test("should allow the event admin to publish a gallery", async () => {
      const Event = require("../models/Event");
      const Photo = require("../models/Photo");
      const Gallery = require("../models/Gallery");
  
      const adminId = new mongoose.Types.ObjectId();
  
      const event = await Event.create({
        name: "Test Wedding",
        createdBy: adminId,
        members: [],
      });
  
      const photo = await Photo.create({
        event: event._id,
        uploadedBy: adminId,
        imageUrl: "https://example.com/test.jpg",
        publicId: "test-photo",
        filename: "test.jpg",
        fileSize: 1000,
      });
  
      const token = jwt.sign(
        {
          id: adminId.toString(),
          role: "admin",
          name: "Test Admin",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      const response = await request(app)
        .post(`/api/gallery/${event._id}/publish`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          photoIds: [photo._id.toString()],
        });
  
      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe("Gallery published successfully.");
      expect(response.body.pin).toMatch(/^\d{6}$/);
      expect(response.body.shareUrl).toMatch(/^\/gallery\/.+/);
  
      const gallery = await Gallery.findOne({
        event: event._id,
      });
  
      expect(gallery).not.toBeNull();
      expect(gallery.isPublished).toBe(true);
    });
  });
  describe("Gallery PIN Verification", () => {
    test("should reject an incorrect gallery PIN", async () => {
      const Gallery = require("../models/Gallery");
  
      const gallery = await Gallery.create({
        event: new mongoose.Types.ObjectId(),
        pin: "123456",
        shareSlug: "testgallery",
        photos: [],
        isPublished: true,
      });
  
      const response = await request(app)
        .post(`/api/gallery/${gallery.shareSlug}/access`)
        .send({
          pin: "654321",
        });
  
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe(
        "Incorrect PIN. Please try again."
      );
    });
  });