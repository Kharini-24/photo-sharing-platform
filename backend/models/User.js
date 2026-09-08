const mongoose = require("mongoose");

// A User is either an "admin" (event lead) or a "member" (team member).
// We never store the plain password -- only its hashed version (see routes/auth.js).
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }, // hashed, never plain text
    role: { type: String, enum: ["admin", "member"], default: "member" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
