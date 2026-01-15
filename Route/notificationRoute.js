import express from "express";
import { protect } from "../Middleware/authMiddleware.js";
import { getMyNotifications, markAsRead } from "../Controller/notificationController.js";


const router = express.Router();

router.get("/",protect,getMyNotifications);
router.put("/:id/read", protect, markAsRead);

export default router;