import express from "express";
import { protect } from "../Middleware/authMiddleware.js";
import { adminRole } from "../Middleware/roleMiddleware.js";
import { deleteUser, getAllStats, getAllUsers, getManagerWorkload, updateUserRole } from "../Controller/adminController.js";


const router=express.Router();

router.use(protect,adminRole);

router.get("/users",getAllUsers);
router.delete("/:id",deleteUser);
router.put("/users/:id/role",updateUserRole);
router.get("/stats",getAllStats);

router.get("/managers/workload", getManagerWorkload);

export default router;