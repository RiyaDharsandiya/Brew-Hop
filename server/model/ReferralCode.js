import mongoose from 'mongoose';

const referralCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountAmount: { type: Number, default: 0 },  // Discount value, e.g. 50
  maxUsage: { type: Number, default: 1 },         // How many times code can be used
  usageCount: { type: Number, default: 0 },       // Track how many times used
  isActive: { type: Boolean, default: true },     // Code active or disabled
});

const ReferralCode = mongoose.model('ReferralCode', referralCodeSchema);
export default ReferralCode;
