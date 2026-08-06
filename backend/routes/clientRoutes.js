import express from "express";
import {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
} from "../controllers/clientController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/:id", authMiddleware, getClient);
router.put("/:id", authMiddleware, updateClient);
router.delete("/:id", authMiddleware, deleteClient);
router.post("/", authMiddleware, createClient);
router.get("/", authMiddleware, getClients);

export default router;