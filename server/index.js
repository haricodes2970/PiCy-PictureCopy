import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import https from "https";
import { connectDB } from "./config/db.js";
import imageRouter from "./routes/image.js";
import adminRouter from "./routes/admin.js";
import cloudinary from "./config/cloudinary.js";
import Image from "./models/Image.js";
import Stats from "./models/Stats.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", imageRouter);
app.use("/admin", adminRouter);

// 🧹 Cleanup + track expired
setInterval(async () => {
  try {
    const expired = await Image.find({
      createdAt: { $lt: new Date(Date.now() - 86400000) }
    });
    for (const img of expired) {
      await cloudinary.uploader.destroy(img.publicId);
      await img.deleteOne();
    }
    if (expired.length > 0) {
      let stats = await Stats.findOne();
      if (!stats) stats = new Stats();
      stats.totalExpired += expired.length;
      await stats.save();
      console.log(`🧹 Cleaned ${expired.length} expired images`);
    }
  } catch (err) {
    console.error("Cleanup error:", err.message);
  }
}, 60 * 60 * 1000);

// 🏓 Keep alive
setInterval(() => {
  https.get("https://picy.onrender.com", (res) => {
    console.log(`🏓 Ping: ${res.statusCode}`);
  }).on("error", err => console.error("Ping failed:", err.message));
}, 10 * 60 * 1000);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});