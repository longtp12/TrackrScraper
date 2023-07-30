import express from "express";
import {
  addGames,
  getGamesPaging
} from "../controllers/game-controller.js";


const router = express.Router();

router.post("/", addGames)

router.get("/", getGamesPaging);


export default router;
