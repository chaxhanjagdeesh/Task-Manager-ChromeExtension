import express from "express";

import Message from "../models/Message.js";
import WorkspaceMember from "../models/WorkspaceMember.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

async function getWorkspaceMembership(
  workspaceId,
  userId
) {
  const member = await WorkspaceMember.findOne({
    workspace: workspaceId,
    user: userId,
  });

  return member;
}

router.get(
  "/:workspaceId/messages",
  authMiddleware,
  async (req, res) => {
    try {
      const { workspaceId } = req.params;
      const userId = req.user.id;

      const member =
        await getWorkspaceMembership(
          workspaceId,
          userId
        );

      if (!member) {
        return res.status(403).json({
          message:
            "You are not a member of this workspace.",
        });
      }

      const messages =
        await Message.find({
          workspace: workspaceId,
        })
          .populate(
            "sender",
            "name email"
          )
          .sort({
            createdAt: 1,
          })
          .limit(200);

      return res.json({
        messages,
      });
    } catch (error) {
      console.error(
        "Failed to load workspace messages:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to load messages.",
      });
    }
  }
);

router.post(
  "/:workspaceId/messages",
  authMiddleware,
  async (req, res) => {
    try {
      const { workspaceId } = req.params;
      const userId = req.user.id;

      const content =
        typeof req.body.content === "string"
          ? req.body.content.trim()
          : "";

      if (!content) {
        return res.status(400).json({
          message:
            "Message cannot be empty.",
        });
      }

      if (content.length > 2000) {
        return res.status(400).json({
          message:
            "Message cannot exceed 2000 characters.",
        });
      }

      const member =
        await getWorkspaceMembership(
          workspaceId,
          userId
        );

      if (!member) {
        return res.status(403).json({
          message:
            "You are not a member of this workspace.",
        });
      }

      const message =
        await Message.create({
          workspace: workspaceId,
          sender: userId,
          content,
        });

      const populatedMessage =
        await Message.findById(
          message._id
        ).populate(
          "sender",
          "name email"
        );

      return res.status(201).json({
        message: populatedMessage,
      });
    } catch (error) {
      console.error(
        "Failed to send workspace message:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to send message.",
      });
    }
  }
);

export default router;