import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["image", "text", "both"],
    default: "image",
  },
  imageUrl: { type: String, default: null },
  publicId: { type: String, default: null },
  text: { type: String, default: null },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400,
  },
});

export default mongoose.model("Image", imageSchema);