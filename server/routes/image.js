import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import Image from "../models/Image.js";

const router = express.Router();
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed!"));
  }
});

// POST /api/:slug — upload image
router.post("/:slug", upload.single("image"), async (req, res) => {
  try {
    const { slug } = req.params;

    const existing = await Image.findOne({ slug });
    if (existing) {
      return res.status(400).json({ error: "This URL is already taken!" });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "picy" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const image = await Image.create({
      slug,
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });

    res.status(201).json({
      imageUrl: image.imageUrl,
      slug: image.slug,
      expiresAt: new Date(image.createdAt.getTime() + 86400000),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/:slug — fetch image
router.get("/:slug", async (req, res) => {
  try {
    const image = await Image.findOne({ slug: req.params.slug });
    if (!image) return res.status(404).json({ error: "No image found!" });

    res.json({
      imageUrl: image.imageUrl,
      slug: image.slug,
      expiresAt: new Date(image.createdAt.getTime() + 86400000),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handler for multer
router.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File too large! Max size is 5MB." });
  }
  res.status(400).json({ error: err.message });
});

export default router;