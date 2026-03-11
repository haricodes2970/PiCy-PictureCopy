import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import imageRouter from "./routes/image.js";
import cloudinary from "./config/cloudinary.js";
import Image from "./models/Image.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", imageRouter);

// 🧹 Cleanup job — runs every hour, deletes expired images from Cloudinary
setInterval(async () => {
  try {
    const expired = await Image.find({
      createdAt: { $lt: new Date(Date.now() - 86400000) }
    });
    for (const img of expired) {
      await cloudinary.uploader.destroy(img.publicId);
      await img.deleteOne();
    }
    if (expired.length > 0) console.log(`🧹 Cleaned ${expired.length} expired images`);
  } catch (err) {
    console.error("Cleanup error:", err.message);
  }
}, 60 * 60 * 1000); // every 1 hour

const PORT = process.env.PORT || 5000;

// 🏓 Self-ping to prevent Render sleep
import https from "https";

setInterval(() => {
  https.get("https://picy.onrender.com", (res) => {
    console.log(`🏓 Ping: ${res.statusCode}`);
  }).on("error", (err) => {
    console.error("Ping failed:", err.message);
  });
}, 10 * 60 * 1000); // every 10 minutes

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});