import express from "express";
import { protect } from "../Middleware/authMiddleware.js";
import { getMyNotifications } from "../Controller/notificationController.js";


const router = express.Router();

router.get("/notification",protect,getMyNotifications);

export default router;