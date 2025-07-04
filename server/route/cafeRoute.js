import express from "express";
import {  addCafe,getCafeById,updateCafe,deleteCafe,getAllCafes} from "../controller/cafeController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllCafes);
router.post("/add",requireAuth, addCafe);
router.get("/:id", getCafeById);
router.put("/:id",requireAuth, updateCafe);
router.delete("/:id",requireAuth, deleteCafe);

export default router;
