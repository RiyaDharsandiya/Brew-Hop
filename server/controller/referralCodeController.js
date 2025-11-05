import ReferralCode from '../model/ReferralCode.js';

export const addReferralCode = async (req, res) => {
  try {
    const { code, discountAmount, maxUsage } = req.body;

    if (!code || discountAmount == null) {
      return res.status(400).json({ message: 'Code and discount amount required.' });
    }

    const existingCode = await ReferralCode.findOne({ code });
    if (existingCode) {
      return res.status(400).json({ message: 'Referral code already exists.' });
    }

    const newReferralCode = new ReferralCode({
      code,
      discountAmount,
      maxUsage,
    });

    await newReferralCode.save();
    res.status(201).json({ message: 'Referral code created successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating referral code.' });
  }
};

export const verifyReferralCode = async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ msg: "Referral code is required" });

  try {
    const referral = await ReferralCode.findOne({ code: code.toUpperCase(), isActive: true });

    if (!referral) return res.status(404).json({ msg: "Referral code invalid or inactive" });

    if (referral.usageCount >= referral.maxUsage) {
      return res.status(400).json({ msg: "Referral code usage limit reached" });
    }

    res.json({
      msg: "Referral code is valid",
      discountAmount: referral.discountAmount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error verifying referral code" });
  }
};