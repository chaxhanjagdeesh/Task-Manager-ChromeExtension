import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createEntry,
  getEntries,
  getEntry,
  updateEntry,
  deleteEntry,
  toggleCutEntry
} from "../controllers/entryController.js";

const router = express.Router();
router.patch("/:id/cut", authMiddleware, toggleCutEntry);
router.get("/single/:id", authMiddleware, getEntry);
router.put("/:id", authMiddleware, updateEntry);
router.delete("/:id", authMiddleware, deleteEntry);
router.post("/:clientId", authMiddleware, createEntry);
router.get("/:clientId", authMiddleware, getEntries);

export default router;