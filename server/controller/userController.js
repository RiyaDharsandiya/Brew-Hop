import nodemailer from "nodemailer";
import User from "../model/User.js";
import Otp from "../model/Otp.js";
import UnverifiedUser from "../model/UnverifiedUser.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import "dotenv/config";
import admin from "../firebase/admin.js";
import Cafe from "../model/Cafe.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    const now = new Date();
    user.paidLocations = user.paidLocations.filter((loc) => {
      if (loc.planExpiryDate && new Date(loc.planExpiryDate) < now) {
        return false;
      }
      return true;
    });

    await user.save();
    res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching current user:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

export const signup = async (req, res) => {
  const { name, email, password,phone } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "Email already registered" });
    // Remove any previous unverified user/otp for this email
    await Otp.deleteOne({ email });
    await UnverifiedUser.deleteOne({ email });

    const otp = crypto.randomInt(100000, 999999).toString();
    const hashed = await bcrypt.hash(password, 10);

    // Save unverified user and OTP in DB
    await UnverifiedUser.create({ name, email, password: hashed, phone });
    await Otp.create({ email, otp });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email Address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f0a500;">Welcome to Brew Hop!</h1>
          <p>Hi ${name},</p>
          <p>Thank you for signing up. Please verify your email address by entering this code:</p>
          <h2 style="background: #f8f5f0; padding: 10px; text-align: center; letter-spacing: 3px; font-size: 24px;">
            ${otp}
          </h2>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>The Cafe Team</p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, function (err, info) {
      if (err) return res.status(500).json({ msg: "Failed to send verification email", error: err.message });
      return res.status(200).json({ message: "Verification code sent to your email.If you don't see the email, please check your spam folder and mark it as 'Not Spam'.", email, name });
    });
  } catch (err) {
    console.log("signup",err.message);
    res.status(500).json({ msg: "Signup error", error: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { email, code } = req.body;
  try {
    const otpDoc = await Otp.findOne({ email });
    if (!otpDoc || otpDoc.otp !== code) {
      return res.status(400).json({ msg: "Invalid or expired verification code" });
    }

    const userData = await UnverifiedUser.findOne({ email });
    if (!userData) return res.status(400).json({ msg: "User data not found" });

    // Create the verified user
    const newUser = await User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
    });

    // Clean up
    await Otp.deleteOne({ email });
    await UnverifiedUser.deleteOne({ email });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.log("verify",err.message);
    res.status(500).json({ msg: "Verification error", error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password, rememberMe } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Set expiry based on rememberMe
    const expiresIn = rememberMe ? "30d" : "7d";
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn });
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.log("login",err.message);
    res.status(500).json({ msg: "Login error", error: err.message });
  }
};


export const handleFirebaseUser = async (req, res) => {
  const { token, name, email, rememberMe } = req.body; // Accept rememberMe from frontend
  if (!token) return res.status(400).json({ message: 'No token provided' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid } = decodedToken;

    if (!email) return res.status(400).json({ message: 'No email in token' });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name: name || decodedToken.name || '', email, firebaseId: uid });
    } else {
      user.firebaseId = user.firebaseId || uid;
      await user.save();
    }

    // Set JWT expiry based on rememberMe
    const expiresIn = rememberMe ? "30d" : "1d";
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn });

    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        firebaseId: user.firebaseId,
        role: user.role
      },
      token: jwtToken
    });
  } catch (error) {
    console.log("google",error.message);
    res.status(401).json({ message: 'Invalid Firebase token', error: error.message });
  }
};


export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.query;
    if (req.user.role !== "admin") return res.status(403).json({ msg: "Access denied" });
    if (!role) return res.status(400).json({ msg: "Role is required in query params" });

    const users = await User.find({ role }).select("name email _id");
    return res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
};

export const claimCafe = async (req, res) => {
  try {
    const { cafeId } = req.body;
    const user = await User.findById(req.user.id);
    const cafe = await Cafe.findById(cafeId);
    if (!user || !cafe) return res.status(404).json({ msg: "User or Cafe not found" });

    const now = new Date();

    // Find the paid location object for the cafe's location
    const paidLocation = user.paidLocations.find(
      (loc) =>
        loc.location === cafe.location &&
        loc.planPurchased &&
        new Date(loc.planExpiryDate) > now
    );

    if (!paidLocation) {
      return res.status(403).json({ msg: "You haven't paid for this location or it has expired." });
    }

    if (paidLocation.beveragesRemaining <= 0) {
      return res.status(400).json({ msg: "No beverages remaining for this location." });
    }

    // Generate QR code / claim code
    const claimCode = crypto.randomBytes(6).toString("hex");

    // Add claim to user's specific location's claimedCafes
    paidLocation.beveragesRemaining -= 1;
    paidLocation.claimedCafes.push({
      cafe: cafe._id,
      claimedAt: now,
      claimCode,
    });

    // Add to cafe's claimedBy array
    cafe.claimedBy.push({
      user: user._id,
      claimedAt: now,
      claimCode,
    });

    // Save both
    await user.save();
    await cafe.save();

    return res.status(200).json({
      msg: "Café claimed successfully.",
      beveragesRemaining: paidLocation.beveragesRemaining,
      claimCode,
    });
  } catch (err) {
    console.error("ClaimCafe Error:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


export const generateQRData = async (req, res) => {
  try {
    const { claimCode } = req.params;

    const user = await User.findOne({ claimCode });
    if (!user) return res.status(404).json({ msg: "Invalid or expired QR code." });

    const claimedEntry = user.claimedCafes.find((c) => c.claimCode === claimCode);
    if (!claimedEntry) return res.status(400).json({ msg: "Claim entry not found." });

    // Optional: Invalidate the claim code after use
    user.claimCode = null;
    await user.save();

    res.status(200).json({
      msg: "Claim verified!",
      user: {
        name: user.name,
        email: user.email,
        beveragesRemaining: user.beveragesRemaining,
      },
    });
  } catch (err) {
    console.error("QR verification failed:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const verifyClaimCode = async (req, res) => {
  try {
    const { claimCode } = req.params;

    // Find the user who has the claim code inside any paidLocation's claimedCafes
    const user = await User.findOne({
      "paidLocations.claimedCafes.claimCode": claimCode,
    });

    if (!user) return res.status(404).json({ msg: "Invalid or expired QR code." });

    let claimedEntry = null;
    let locationObj = null;

    // Loop to locate the specific claimed entry and its parent location object
    for (const loc of user.paidLocations) {
      claimedEntry = loc.claimedCafes.find((c) => c.claimCode === claimCode);
      if (claimedEntry) {
        locationObj = loc;
        break;
      }
    }

    if (!claimedEntry) return res.status(400).json({ msg: "Claim entry not found." });
    if (claimedEntry.redeemed) return res.status(400).json({ msg: "QR code already redeemed." });

    const cafe = await Cafe.findById(claimedEntry.cafe);
    if (!cafe) return res.status(404).json({ msg: "Café not found." });
    if (String(cafe.assignedTo) !== String(req.user.id)) return res.status(403).json({ msg: "Unauthorized." });

    // Mark claim as redeemed
    claimedEntry.redeemed = true;
    await user.save();

    // Update redeemed status in the cafe's claimedBy array
    await Cafe.updateOne(
      { _id: claimedEntry.cafe, "claimedBy.user": user._id },
      { $set: { "claimedBy.$.redeemed": true } }
    );

    req.app.get("io").emit("claim-redeemed", {
      userId: user._id.toString(),
      cafeId: claimedEntry.cafe.toString(),
    });

    return res.json({
      msg: `Claim verified and redeemed for café: ${cafe.name}`,
      user: { name: user.name, email: user.email },
      claimedAt: claimedEntry.claimedAt,
    });
  } catch (err) {
    console.error("verifyClaimCode error:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

