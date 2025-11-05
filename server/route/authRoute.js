import express from "express";
import { signup, login, handleFirebaseUser, verifyEmail, claimCafe, generateQRData, verifyClaimCode, getUsersByRole, getCurrentUser } from "../controller/userController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/firebase", handleFirebaseUser);
router.post("/verify-email", verifyEmail);
router.get("/", requireAuth, getUsersByRole);
router.get("/me", requireAuth, getCurrentUser);
//cafe
router.post("/claim-cafe", requireAuth, claimCafe);

// User: Generates data to be embedded in QR
router.get("/qr/:claimCode", generateQRData);

// ☕ Cafe owner: Verifies QR claim (only if owner)
router.get("/verify/:claimCode", requireAuth, verifyClaimCode);
export default router;
