import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import Image from "../models/Image.js";
import Stats from "../models/Stats.js";

const router = express.Router();
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed!"));
  }
});

const trackStat = async (type) => {
  const today = new Date().toISOString().split("T")[0];
  let stats = await Stats.findOne();
  if (!stats) stats = new Stats();
  if (type === "upload") {
    stats.totalUploads += 1;
    const day = stats.dailyStats.find(d => d.date === today);
    if (day) day.uploads += 1;
    else stats.dailyStats.push({ date: today, uploads: 1, visits: 0 });
  }
  if (type === "visit") {
    stats.totalVisits += 1;
    const day = stats.dailyStats.find(d => d.date === today);
    if (day) day.visits += 1;
    else stats.dailyStats.push({ date: today, visits: 1, uploads: 0 });
  }
  if (type === "expired") stats.totalExpired += 1;
  stats.dailyStats = stats.dailyStats.slice(-30);
  await stats.save();
};

// POST /api/:slug — upload image, text, or both
router.post("/:slug", upload.single("image"), async (req, res) => {
  try {
    const { slug } = req.params;
    const { type, text } = req.body;

    const existing = await Image.findOne({ slug });
    if (existing) {
      return res.status(400).json({ error: "This URL is already taken!" });
    }

    let imageUrl = null;
    let publicId = null;

    if ((type === "image" || type === "both") && req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "picy" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });
      imageUrl = result.secure_url;
      publicId = result.public_id;
    }

    const item = await Image.create({
      slug,
      type: type || "image",
      imageUrl,
      publicId,
      text: text || null,
    });

    await trackStat("upload");

    res.status(201).json({
      slug: item.slug,
      type: item.type,
      imageUrl: item.imageUrl,
      text: item.text,
      expiresAt: item.expiresAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/:slug/overwrite
router.put("/:slug/overwrite", upload.single("image"), async (req, res) => {
  try {
    const { slug } = req.params;
    const existing = await Image.findOne({ slug });
    if (!existing) return res.status(404).json({ error: "Slug not found!" });

    if (existing.publicId) await cloudinary.uploader.destroy(existing.publicId);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "picy" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    existing.imageUrl = result.secure_url;
    existing.publicId = result.public_id;
    await existing.save();

    res.json({
      imageUrl: existing.imageUrl,
      slug: existing.slug,
      expiresAt: new Date(existing.createdAt.getTime() + 86400000),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/:slug/replace — replace everything (type, image, text)
router.put("/:slug/replace", upload.single("image"), async (req, res) => {
  try {
    const { slug } = req.params;
    const { type, text } = req.body;
    const existing = await Image.findOne({ slug });
    if (!existing) return res.status(404).json({ error: "Slug not found!" });

    if (existing.publicId) await cloudinary.uploader.destroy(existing.publicId);

    let imageUrl = null;
    let publicId = null;

    if ((type === "image" || type === "both") && req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "picy" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });
      imageUrl = result.secure_url;
      publicId = result.public_id;
    }

    existing.type = type || "image";
    existing.imageUrl = imageUrl;
    existing.publicId = publicId;
    existing.text = text || null;
    await existing.save();

    res.json({
      slug: existing.slug,
      type: existing.type,
      imageUrl: existing.imageUrl,
      text: existing.text,
      expiresAt: existing.expiresAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/:slug/blank
router.put("/:slug/blank", async (req, res) => {
  try {
    const { slug } = req.params;
    const existing = await Image.findOne({ slug });
    if (!existing) return res.status(404).json({ error: "Slug not found!" });

    if (existing.publicId) await cloudinary.uploader.destroy(existing.publicId);

    const blankPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64"
    );

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "picy" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(blankPng);
    });

    existing.imageUrl = result.secure_url;
    existing.publicId = result.public_id;
    await existing.save();

    res.json({ imageUrl: existing.imageUrl, slug: existing.slug, message: "Image cleared!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/:slug/text — update text only
router.put("/:slug/text", async (req, res) => {
  try {
    const { slug } = req.params;
    const { text } = req.body;
    const existing = await Image.findOne({ slug });
    if (!existing) return res.status(404).json({ error: "Slug not found!" });
    existing.text = text;
    await existing.save();
    res.json({ slug: existing.slug, text: existing.text, message: "Text updated!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/:slug
router.get("/:slug", async (req, res) => {
  try {
    const image = await Image.findOne({ slug: req.params.slug });
    if (!image) return res.status(404).json({ error: "No image found!" });
    await trackStat("visit");
    res.json({
      slug: image.slug,
      type: image.type,
      imageUrl: image.imageUrl,
      text: image.text,
      expiresAt: image.expiresAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File too large! Max size is 5MB." });
  }
  res.status(400).json({ error: err.message });
});

export default router;
