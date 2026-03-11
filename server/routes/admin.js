import express from "express";
import Image from "../models/Image.js";
import Stats from "../models/Stats.js";

const router = express.Router();

// Middleware — secret password check
const auth = (req, res, next) => {
  const pass = req.headers["x-admin-password"];
  if (pass !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// GET /admin/stats
router.get("/stats", auth, async (req, res) => {
  try {
    const stats = await Stats.findOne() || {};
    const activeImages = await Image.countDocuments();
    const recentImages = await Image.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("slug createdAt");

    res.json({
      totalUploads: stats.totalUploads || 0,
      totalExpired: stats.totalExpired || 0,
      totalVisits: stats.totalVisits || 0,
      activeImages,
      dailyStats: stats.dailyStats || [],
      recentImages,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;