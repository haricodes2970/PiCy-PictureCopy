import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // ⏱️ auto-delete after 24 hours (in seconds)
  },
});

export default mongoose.model("Image", imageSchema);