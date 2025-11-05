import express from 'express';
import { addReferralCode, verifyReferralCode } from '../controller/referralCodeController.js';

const router = express.Router();

// POST /admin/referral-codes - Create referral code (admin)
router.post('/admin/referral-codes', addReferralCode);
router.post("/referral-codes/verify", verifyReferralCode);
export default router;
