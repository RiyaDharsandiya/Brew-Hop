import jwt from "jsonwebtoken";
import User from "../model/User.js";

export const requireAuth = async (req, res, next) => {
  try {
    // Get token from headers or session (adjust depending on client behavior)
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return res.status(401).json({ msg: "User not found" });

    req.user = user; // Attach user info to request
    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};
