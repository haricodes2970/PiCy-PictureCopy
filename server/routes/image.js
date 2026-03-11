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
        (error, result) => { if (error) reject(error); else resolve(result); }
      ).end(req.file.buffer);
    });
    const image = await Image.create({
      slug, imageUrl: result.secure_url, publicId: result.public_id,
    });
    await trackStat("upload");
    res.status(201).json({
      imageUrl: image.imageUrl, slug: image.slug,
      expiresAt: new Date(image.createdAt.getTime() + 86400000),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/:slug/overwrite — replace with new image
router.put("/:slug/overwrite", upload.single("image"), async (req, res) => {
  try {
    const { slug } = req.params;
    const existing = await Image.findOne({ slug });
    if (!existing) return res.status(404).json({ error: "Slug not found!" });

    // Delete old from Cloudinary
    await cloudinary.uploader.destroy(existing.publicId);

    // Upload new to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "picy" },
        (error, result) => { if (error) reject(error); else resolve(result); }
      ).end(req.file.buffer);
    });

    existing.imageUrl = result.secure_url;
    existing.publicId = result.public_id;
    await existing.save();

    res.json({
      imageUrl: existing.imageUrl, slug: existing.slug,
      expiresAt: new Date(existing.createdAt.getTime() + 86400000),
      message: "Image replaced successfully!"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/:slug/blank — replace with tiny blank image
router.put("/:slug/blank", async (req, res) => {
  try {
    const { slug } = req.params;
    const existing = await Image.findOne({ slug });
    if (!existing) return res.status(404).json({ error: "Slug not found!" });

    // Delete old from Cloudinary
    await cloudinary.uploader.destroy(existing.publicId);

    // 1x1 transparent PNG — only 68 bytes!
    const blankPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64"
    );

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "picy", public_id: `