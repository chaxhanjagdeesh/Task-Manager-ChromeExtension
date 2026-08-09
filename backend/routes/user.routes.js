import express from "express";

import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../controllers/user.controller.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware, getProfile);

router.put("/profile", authMiddleware, updateProfile);

router.put("/password", authMiddleware, changePassword);

router.delete("/", authMiddleware, deleteAccount);

export default router;