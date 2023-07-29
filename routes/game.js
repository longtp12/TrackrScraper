import express from "express";
import {
  getGamesPaging
} from "../controllers/game-controller.js";


const router = express.Router();


router.get("/", getGamesPaging);


export default router;
