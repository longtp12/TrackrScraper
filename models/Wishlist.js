import mongoose, { now } from "mongoose";

const WishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  games: [
    {
      gameId: { type: String },
      gameTitle: { type: String },
      gameSlug: { type: String },
      gameImg: { type: String },
      dateAdded: { type: Date, default: Date.now },
      lowestPriceAdded: { type: Number },
      storeAdded: { type: String },
    },
  ],
});

export default mongoose.model("Wishlist", WishlistSchema);
