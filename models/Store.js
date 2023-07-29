import mongoose from "mongoose";

const StoreSchema = new mongoose.Schema({
  type: { type: Number, required: true },
  name: { type: String, required: true },
  firstPageUrl: {
    ps5: { type: String },
    ps5Old: { type: String },
    ps4: { type: String },
    ps4Old: { type: String },
    ps3: { type: String },
    ps2: { type: String },
    psVita: { type: String },
    psVitaOld: { type: String },
    switch: { type: String },
    switchOld: { type: String },
    DS: { type: String },
    xbox: { type: String },
  },
  nextPageUrl: { type: Array },
  baseUrl: { type: String },
  productSelector: { type: String, required: true },
  productTitleSelector: { type: String, required: true },
  productCurrentPriceSelector: { type: String, required: true },
  productOriginalPriceSelector: { type: String },
  productLinkSelector: { type: String },
  nextPageSelector: { type: String },
});

export default mongoose.model("Store", StoreSchema);
