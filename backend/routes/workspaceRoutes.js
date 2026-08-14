import express from "express";

import {
  createWorkspace,
  getMyWorkspaces,
  getWorkspace,
  getWorkspaceMembers,
  createInvitation,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
} from "../controllers/workspaceController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", authMiddleware, createWorkspace);
router.get("/", authMiddleware, getMyWorkspaces);
router.get(
  "/invitations",
  authMiddleware,
  getMyInvitations
);
router.post(
  "/:id/invitations",
  authMiddleware,
  createInvitation
);
router.post(
  "/invitations/:id/accept",
  authMiddleware,
  acceptInvitation
);
router.post(
  "/invitations/:id/reject",
  authMiddleware,
  rejectInvitation
);
router.get(
  "/:id/members",
  authMiddleware,
  getWorkspaceMembers
);
router.get(
  "/:id",
  authMiddleware,
  getWorkspace
);

export default router;