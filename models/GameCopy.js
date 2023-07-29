import mongoose from "mongoose";

const GameCopySchema = new mongoose.Schema({
  title: { type: String },
  platform: { type: String },
  storeName: { type: String },
  retailPrice: [
    {
      price: { type: Number },
      timeStamp: { type: Date, default: Date.now },
    },
  ],
  originalPrice: { type: Number },
  link: { type: String },
  isDisabled: { type: Boolean, default: false },
});

export default mongoose.model("GameCopy", GameCopySchema);
