import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  createWorkspaceTask,
  getWorkspaceTasks,
  getWorkspaceTask,
  updateWorkspaceTask,
  deleteWorkspaceTask,
} from "../controllers/workspaceTaskController.js";

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
router.delete(
  "/:id/tasks/:taskId",
  authMiddleware,
  deleteWorkspaceTask
);

router.put(
  "/:id/tasks/:taskId",
  authMiddleware,
  updateWorkspaceTask
);

router.get(
  "/:id/tasks/:taskId",
  authMiddleware,
  getWorkspaceTask
);

export default router;