import mongoose from "mongoose";

const GameSchema = new mongoose.Schema({
  title: { type: String },
  slug: { type: String },
  releaseDate: { type: String },
  platforms: { type: Array },
  genres: { type: Array },
  developers: { type: Array },
  publishers: { type: Array },
  metaScore: { type: Number },
  backgroundImage: { type: String },
  shortScreenshots: { type: Array },
  description: { type: String },
  isDisabled: { type: Boolean, default: false },
});

export default mongoose.model("Game", GameSchema);
