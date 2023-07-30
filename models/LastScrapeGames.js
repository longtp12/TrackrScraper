import mongoose from "mongoose";

const LastScrapeGamesSchema = new mongoose.Schema({
  lastScrapeAt: { type: Date },
  lastScrapePlatform: { type: String },
});

export default mongoose.model("LastScrapeGames", LastScrapeGamesSchema);
