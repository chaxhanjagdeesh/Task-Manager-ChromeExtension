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

// ------------------------------------
// Workspace routes
// ------------------------------------

router.post("/", authMiddleware, createWorkspace);

router.get("/", authMiddleware, getMyWorkspaces);

// ------------------------------------
// Invitation routes
// IMPORTANT: these MUST come before /:id
// ------------------------------------

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

// ------------------------------------
// Workspace-specific routes
// ------------------------------------

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