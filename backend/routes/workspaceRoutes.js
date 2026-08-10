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

/*
 * =========================================================
 * WORKSPACES
 * =========================================================
 */

// Create workspace
router.post(
  "/",
  authMiddleware,
  createWorkspace
);

// Get current user's workspaces
router.get(
  "/",
  authMiddleware,
  getMyWorkspaces
);


/*
 * =========================================================
 * INVITATIONS
 *
 * IMPORTANT:
 * These routes MUST come before /:id
 * =========================================================
 */

// Get invitations for current user
router.get(
  "/invitations",
  authMiddleware,
  getMyInvitations
);

// Accept invitation
router.post(
  "/invitations/:id/accept",
  authMiddleware,
  acceptInvitation
);

// Reject invitation
router.post(
  "/invitations/:id/reject",
  authMiddleware,
  rejectInvitation
);


/*
 * =========================================================
 * WORKSPACE-SPECIFIC ROUTES
 * =========================================================
 */

// Create invitation for a workspace
router.post(
  "/:id/invitations",
  authMiddleware,
  createInvitation
);

// Get workspace members
router.get(
  "/:id/members",
  authMiddleware,
  getWorkspaceMembers
);

// Get workspace
router.get(
  "/:id",
  authMiddleware,
  getWorkspace
);


export default router;