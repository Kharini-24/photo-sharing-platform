const cloudinary = require("cloudinary").v2;

// Cloudinary is our "object storage" (like the requirement doc asks for --
// AWS S3 / Azure Blob / GCS are equivalent options, we chose Cloudinary
// because it's free and fast to set up for a project like this).
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
