import mongoose from "mongoose";

const LastScrapeWebstoreSchema = new mongoose.Schema({
  lastScrapeAt: { type: Date },
  lastScrapeAtStore: { type: String },
  lastScrapeAtStoreIndex: { type: Number },
});

export default mongoose.model("LastScrapeWebstore", LastScrapeWebstoreSchema);
