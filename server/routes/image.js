import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import Image from "../models/Image.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/:slug — upload image
router.post("/:slug", upload.single("image"), async (req, res) => {
  try {
    const { slug } = req.params;

    // Check if slug already taken
    const existing = await Image.findOne({ slug });
    if (existing) {
      return res.status(400).json({ error: "This URL is already taken!" });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "picy" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Save to MongoDB
    const image = await Image.create({
      slug,
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });

    res.status(201).json({ imageUrl: image.imageUrl, slug: image.slug });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/:slug — fetch image
router.get("/:slug", async (req, res) => {
  try {
    const image = await Image.findOne({ slug: req.params.slug });
    if (!image) return res.status(404).json({ error: "No image found!" });
    res.json({ imageUrl: image.imageUrl, slug: image.slug });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;