import express from "express";
import { googleAuth, appleAuth } from "../controllers/authController.js";

const router = express.Router();

router.post("/google", googleAuth);
router.post("/apple", appleAuth);

export default router;
