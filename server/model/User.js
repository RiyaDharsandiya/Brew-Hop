import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: String },
  firebaseId: { type: String, unique: true, sparse: true },
  role: {
    type: String,
    enum: ["admin", "user", "cafe"],
    default: "user",
  },
  coupon: { type: Boolean, default: false },
  referralName:{ type: String },
  paidLocations: [
    {
      location: { type: String },
      planPurchased: { type: Boolean, default: false },
      orderId: { type: String },
      beveragesRemaining: { type: Number, default:10 },
      planStartDate: { type: Date },
      planExpiryDate: { type: Date },
      claimedCafes: [
        {
          cafe: { type: mongoose.Schema.Types.ObjectId, ref: "Cafe" },
          claimedAt: { type: Date, default: Date.now },
          claimCode: { type: String },
          redeemed: { type: Boolean, default: false },
          default: [],
        },
      ],
    },
  ],
});

const User = mongoose.model("User", userSchema);
export default User;
