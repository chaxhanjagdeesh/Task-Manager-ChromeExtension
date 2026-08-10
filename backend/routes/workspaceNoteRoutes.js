import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  createWorkspaceNote,
  getWorkspaceNotes,
  getWorkspaceNote,
  updateWorkspaceNote,
  deleteWorkspaceNote,
} from "../controllers/workspaceNoteController.js";

const router = express.Router();

router.post(
  "/:id/notes",
  authMiddleware,
  createWorkspaceNote
);

router.get(
  "/:id/notes",
  authMiddleware,
  getWorkspaceNotes
);

router.get(
  "/:id/notes/:noteId",
  authMiddleware,
  getWorkspaceNote
);

router.put(
  "/:id/notes/:noteId",
  authMiddleware,
  updateWorkspaceNote
);
router.delete(
  "/:id/notes/:noteId",
  authMiddleware,
  deleteWorkspaceNote
);

export default router;