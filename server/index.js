import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import imageRouter from "./routes/image.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", imageRouter);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});