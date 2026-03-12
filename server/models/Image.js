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
  },
  expiresAt: {
    type: Date,
  },
});

imageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

imageSchema.pre("save", function (next) {
  if (!this.expiresAt) {
    if (this.type === "text") {
      this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week
    } else {
      this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }
  }
  next();
});

export default mongoose.model("Image", imageSchema);