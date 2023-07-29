import express from "express";
import {
  addGameCopies,
  deleteGameCopies,
  deleteGameCopy,
  disableGameCopy,
  filterPrice,
  getGameCopies,
  getGameCopiesNumbers,
  searchGameCopiesByName,
  searchGameCopiesByStore,
  searchGameCopiesDetails,
  updatePrice,
} from "../controllers/gameCopy-controller.js";

const router = express.Router();

// ADD GAME COPIES FROM SCRAPING
router.post("/", addGameCopies);

// SEARCH FOR GAME COPIES BY NAME
router.post("/search", searchGameCopiesByName);
// SEARCH FOR GAME COPIES BY STORE
router.get("/search", searchGameCopiesByStore);

router.post("/search/detail", searchGameCopiesDetails);
// GET ALL GAME COPIES
router.get("/", getGameCopies);

router.get("/getGameCopiesNumbers", getGameCopiesNumbers)

router.delete("/", deleteGameCopies);

router.delete("/:id", deleteGameCopy);

router.put("/:id", updatePrice);

router.post("/filterPrice", filterPrice)

router.put("/disable/:gameCopyId", disableGameCopy)

export default router;
