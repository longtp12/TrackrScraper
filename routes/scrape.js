import express from "express";
import LastScrapeLazada from "../models/LastScrapeLazada.js";
import LastScrapeWebstore from "../models/LastScrapeWebstore.js";
import Store from "../models/Store.js";
import { request } from "../requestMethod.js";
import { scrapeLazada } from "../scrapeLazada.js";
import { scrapeAllStoresType1Cheerio } from "../scrapeWebstoreType1.js";
import { scrapeAllStoreType2 } from "../scrapeWebstoreType2.js";
import { getGamesByPlatform } from "../getGames.js";

const router = express.Router();

let isProcessing = false;

const blockRequests = (req, res, next) => {
  if (isProcessing) {
    return res.json({
      type: "error",
      message: "Scraping in progess. Please try again later.",
    });
  }
  isProcessing = true;
  next();
};

router.get("/status", (req, res) => {
  try {
    let status;
    if (!isProcessing) status = "Ready";
    else status = "In progress";
    return res.status(200).json({ type: "success", message: status });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/scrapeWebstore", blockRequests, async (req, res) => {
  try {
    const stores = await Store.find();
    const lastScrape = await LastScrapeWebstore.find();
    const storeIndex = lastScrape[0].lastScrapeAtStoreIndex;
    let filteredStores;
    if (storeIndex < stores.length - 1) {
      filteredStores = stores.slice(storeIndex);
    } else filteredStores = stores;

    await scrapeAllStoreType2(filteredStores, stores);
    await scrapeAllStoresType1Cheerio(filteredStores, stores);
    await request.get("/user");
    res.status(200).json({ type: "success", message: "Done scraping" });
  } catch (error) {
    res.status(500).json(error);
  } finally {
    isProcessing = false;
  }
});
router.get("/scrapeLazada/:initialPage", blockRequests, async (req, res) => {
  const initialPage = req.params.initialPage;
  try {
    isProcessing = true;
    await scrapeLazada(isProcessing, initialPage);
    await request.get("/user");
    res.status(200).json({ type: "success", message: "Done scraping" });
  } catch (error) {
    res.status(500).json(error);
  } finally {
    isProcessing = false;
  }
});

router.put("/lastScrape", async (req, res) => {
  try {
    const lastScrape = await LastScrapeLazada.find();
    if (lastScrape.length === 0) {
      const newLastScrape = new LastScrapeLazada({
        lastScrapeAt: req.body.lastScrapeAt,
        lastScrapeAtPage: req.body.lastScrapeAtPage,
        lastScrapeGames: req.body.lastScrapeGames,
      });
      await newLastScrape.save();
    } else {
      const lastScrapeDoc = lastScrape[0];
      lastScrapeDoc.lastScrapeAt = req.body.lastScrapeAt;
      lastScrapeDoc.lastScrapeAtPage = req.body.lastScrapeAtPage;
      lastScrapeDoc.lastScrapeGames = req.body.lastScrapeGames;
      await lastScrapeDoc.save();
    }
    res.status(200).json({ type: "success", message: "Save successful" });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.put("/lastScrapeWebstore", async (req, res) => {
  try {
    const lastScrape = await LastScrapeWebstore.find();
    if (lastScrape.length === 0) {
      const newLastScrape = new LastScrapeWebstore({
        lastScrapeAt: req.body.lastScrapeAt,
        lastScrapeAtStore: req.body.lastScrapeAtStore,
        lastScrapeAtStoreIndex: req.body.lastScrapeAtStoreIndex,
      });
      await newLastScrape.save();
    } else {
      const lastScrapeDoc = lastScrape[0];
      lastScrapeDoc.lastScrapeAt = req.body.lastScrapeAt;
      lastScrapeDoc.lastScrapeAtStore = req.body.lastScrapeAtStore;
      lastScrapeDoc.lastScrapeAtStoreIndex = req.body.lastScrapeAtStoreIndex;
      await lastScrapeDoc.save();
    }
    res.status(200).json({ type: "success", message: "Save successful" });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/getLastScrape", async (req, res) => {
  const scrape = await LastScrapeLazada.find();
  res.json(scrape[0]);
});

router.get("/getLastScrapeWebstore", async (req, res) => {
  const scrape = await LastScrapeWebstore.find();
  res.json(scrape[0]);
});

router.get("/scrapeGames/", blockRequests, async (req, res) => {
  try {
    const platform = req.query.platform;
    let platformId;
    if (platform === "ps5") platformId = 187;
    else if (platform === "ps4") platformId = 18;
    else if (platform === "ps3") platformId = 16;
    else if (platform === "switch") platformId = 7;
    else return res.json({ type: "error", message: "Invalid platform" });

    await getGamesByPlatform(platformId);
    res.status(200).json({ type: "success", message: "finish scraping" });
  } catch (error) {
    res.status(500).json(error);
  } finally {
    isProcessing = false;
  }
});

export default router;
