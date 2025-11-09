import mongoose from "mongoose";

const cafeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    location: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    timeFrom: { type: String },  
    timeTo: { type: String },    
    menuLink: { type: String },
    comments: { type: String, default: "" },
    bgImage: { type: String },
    claimedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        claimedAt: { type: Date, default: Date.now },
        claimCode: { type: String },
        redeemed: { type: Boolean, default: false },
        amount:{ type: Number}
      }    
    ],
  },
  { timestamps: true, collection: "cafe" }
);

export default mongoose.model("Cafe", cafeSchema);
