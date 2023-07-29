import cors from "cors";
import dotenv from "dotenv";
import express, { json } from "express";
import mongoose from "mongoose";
import { request } from "./requestMethod.js";
import gameCopyRoutes from "./routes/gameCopy.js";
import scrapeRoutes from "./routes/scrape.js";
import gameRoutes from "./routes/game.js"
import userRoutes from "./routes/user.js"
import { scrapeLazada } from "./scrapeLazada.js";
import { scrapeAllStoresType1Cheerio } from "./scrapeWebstoreType1.js";
import { scrapeAllStoreType2 } from "./scrapeWebstoreType2.js";

const getStores = async () => {
  const storesData = await request.get("/store");
  return storesData.data;
};

const notifyUsers = async () => {
  const res = await request.get("/user");
  console.log(res.data.message);
};

const addGameCopiestoDB = async () => {
  try {
    const stores = await getStores();
    console.log("Get stores successful");
    await scrapeAllStoreType2(stores);
    await scrapeAllStoresType1Cheerio(stores);
    await scrapeLazada();
    await notifyUsers();
  } catch (error) {
    console.error(error);
  }
};

// addGameCopiestoDB()

const app = express();

app.use(json());
dotenv.config();
app.use(cors());

app.use("/scraper/gameCopy", gameCopyRoutes)
app.use("/scraper/scrape", scrapeRoutes)
app.use("/scraper/user", userRoutes)
app.use("/scraper/game", gameRoutes)

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB connection succesful"))
  .catch((err) => console.log(err));

app.listen(8006, () => {
  console.log("Scraper server is running");
});
