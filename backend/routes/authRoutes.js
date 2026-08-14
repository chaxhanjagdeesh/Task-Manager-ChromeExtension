import express from "express";
import {
  register,
  login,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/heartbeat", authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      lastSeen: new Date(),
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Heartbeat failed:", error);
    res.status(500).json({
      message: "Failed to update presence",
    });
  }
});

export default router;