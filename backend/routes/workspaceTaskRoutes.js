import express from "express";

import {
  createWorkspaceTask,
  getWorkspaceTasks,
  getWorkspaceTask,
  updateWorkspaceTask,
  deleteWorkspaceTask,
} from "../controllers/workspaceTaskController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
router.post(
  "/:id/tasks",
  authMiddleware,
  createWorkspaceTask
);
router.get(
  "/:id/tasks",
  authMiddleware,
  getWorkspaceTasks
);
router.get(
  "/:id/tasks/:taskId",
  authMiddleware,
  getWorkspaceTask
);
router.put(
  "/:id/tasks/:taskId",
  authMiddleware,
  updateWorkspaceTask
);
router.delete(
  "/:id/tasks/:taskId",
  authMiddleware,
  deleteWorkspaceTask
);

export default router;