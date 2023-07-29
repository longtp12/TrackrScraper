import express from "express";
import { notifyUsers } from "../controllers/user-controller.js";

const router = express.Router();

router.get("/", notifyUsers)


export default router