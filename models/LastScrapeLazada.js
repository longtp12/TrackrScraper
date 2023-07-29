import mongoose from "mongoose";

const LastScrapeLazadaSchema = new mongoose.Schema({
  lastScrapeAt: { type: Date },
  lastScrapeAtPage: { type: Number },
  lastScrapeGames: { type: Array },
});

export default mongoose.model("LastScrapeLazada", LastScrapeLazadaSchema);
