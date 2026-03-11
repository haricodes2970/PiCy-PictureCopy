import mongoose from "mongoose";

const statsSchema = new mongoose.Schema({
  totalUploads: { type: Number, default: 0 },
  totalExpired: { type: Number, default: 0 },
  totalVisits: { type: Number, default: 0 },
  dailyStats: [{
    date: String,
    uploads: { type: Number, default: 0 },
    visits: { type: Number, default: 0 },
  }],
});

export default mongoose.model("Stats", statsSchema);