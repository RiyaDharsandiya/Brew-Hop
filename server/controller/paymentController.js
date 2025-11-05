import User from '../model/User.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Cafe from '../model/Cafe.js';
import ReferralCode from '../model/ReferralCode.js';

const instance = new Razorpay({
  key_id: process.env.RAZOR_PAY_API_KEY, 
  key_secret: process.env.RAZOR_PAY_API_SECRET
});

export const createOrder = async (req, res) => {
  const { amount, currency } = req.body;
  const options = {
    amount: amount * 100,
    currency,
    receipt: 'order_' + Date.now()
  };
  try {
    const order = await instance.orders.create(options);
    res.json({ orderId: order.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, location, couponCode, referralName, referralCouponCode } = req.body;

  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZOR_PAY_API_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generated_signature !== razorpay_signature) {
    return res.status(400).json({ msg: "Payment verification failed" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    console.log('verifyPayment called with referralCouponCode:', referralCouponCode);

if (referralCouponCode) {
  const referralDoc = await ReferralCode.findOne({ code: referralCouponCode.toUpperCase(), isActive: true });
  if (!referralDoc) {
    console.log('Referral code invalid');
    return res.status(400).json({ msg: "Invalid referral coupon code" });
  }
  console.log('Referral code usageCount before:', referralDoc.usageCount);
  referralDoc.usageCount += 1;
  if (referralDoc.usageCount >= referralDoc.maxUsage) {
    referralDoc.isActive = false;
  }
  await referralDoc.save();
  console.log('Referral code usageCount after:', referralDoc.usageCount);

      // Optionally also find referrer user by referral code and increase their referral count
      const referrerUser = await User.findOne({ referralCode: referralCouponCode });
      if (referrerUser) {
        referrerUser.referralCount = (referrerUser.referralCount || 0) + 1;
        await referrerUser.save();

        // Mark referral on current user for tracking if needed
        user.referredBy = referrerUser._id;
      }
    }

    // Store referral name (if provided)
    if (referralName) {
      user.referralName = referralName;
    }

    // Handle coupon status update with couponCode as before
    if (couponCode === "FIRST100" && user.coupon === false) {
      user.coupon = true;
    } else if (couponCode === "SECOND100" && user.coupon === true) {
      user.coupon = null;
    } else if (!couponCode) {
      if (user.coupon === false) {
        user.coupon = true;
      } else if (user.coupon === true) {
        user.coupon = null;
      }
    }

    const planStartDate = new Date();
    const planExpiryDate = new Date(planStartDate);
    planExpiryDate.setMonth(planStartDate.getMonth() + 1);

    const paidLocation = user.paidLocations.find((p) => p.location === location);

    if (paidLocation) {
      const claimedCafeIds = paidLocation.claimedCafes.map((entry) => entry.cafe);
      await Cafe.updateMany(
        { _id: { $in: claimedCafeIds } },
        { $pull: { claimedBy: { user: userId } } }
      );

      paidLocation.planPurchased = true;
      paidLocation.orderId = razorpay_order_id;
      paidLocation.planStartDate = planStartDate;
      paidLocation.planExpiryDate = planExpiryDate;
      paidLocation.beveragesRemaining = 10;
      paidLocation.claimedCafes = [];
    } else {
      user.paidLocations.push({
        location,
        planPurchased: true,
        orderId: razorpay_order_id,
        planStartDate,
        planExpiryDate,
        beveragesRemaining: 10,
        claimedCafes: [],
      });
    }

    await user.save();

    await Cafe.updateMany(
      { location },
      { $pull: { claimedBy: { user: userId } } }
    );

    res.json({ msg: `Payment verified and plan for '${location}' activated.` });
  } catch (err) {
    console.error("Payment verification error:", err.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};



