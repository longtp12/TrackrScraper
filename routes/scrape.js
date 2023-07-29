import express from "express";
import Store from "../Models/Store.js";
import { scrapeAllStoresType1Cheerio } from "../scrapeWebstoreType1.js";
import { scrapeAllStoreType2 } from "../scrapeWebstoreType2.js";
import { scrapeLazada } from "../scrapeLazada.js";
import { request } from "../requestMethod.js";
import LastScrapeLazada from "../models/LastScrapeLazada.js";

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

router.get("/cancelScrape", (req, res) => {
  // Set the cancel flag to true to stop scraping
  cancelFlag = true;
  return res.json({
    type: "success",
    message: "Scraping process is canceled.",
  });
});

router.get("/scrapeWebstore", blockRequests, async (req, res) => {
  try {
    const stores = await Store.find();
    await scrapeAllStoreType2(stores);
    await scrapeAllStoresType1Cheerio(stores);
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

router.get("/getLastScrape", async (req, res) => {
  const scrape = await LastScrapeLazada.find();
  res.json(scrape[0]);
});

export default router;
