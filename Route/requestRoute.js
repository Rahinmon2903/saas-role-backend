import express from "express";
import { protect } from "../Middleware/authMiddleware.js";
import { createRequest, getAllRequests, getManagerRequests, getRequests, updateRequestStatus } from "../Controller/requestController.js";
import { adminRole, managerRole } from "../Middleware/roleMiddleware.js";


const router=express.Router();

//User access
router.post("/create",protect,createRequest);
router.get("/",protect,getRequests);

//manager access
router.get("/assigned",protect,managerRole,getManagerRequests);
router.put("/:id",protect,managerRole,updateRequestStatus);

//admin access
router.get("/all",protect,adminRole,getAllRequests);

export default router;