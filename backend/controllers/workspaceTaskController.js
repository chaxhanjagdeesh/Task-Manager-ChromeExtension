import WorkspaceTask from "../models/WorkspaceTask.js";
import WorkspaceMember from "../models/WorkspaceMember.js";

export const createWorkspaceTask = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      participants = [],
      priority,
      dueDate,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    // The creator must be a member of the workspace.
    const creatorMembership = await WorkspaceMember.findOne({
      workspace: id,
      user: req.user.id,
    });

    if (!creatorMembership) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // Remove duplicates and make sure creator is included.
    const participantIds = [
      ...new Set([
        req.user.id,
        ...participants.map((userId) => userId.toString()),
      ]),
    ];

    // Verify every participant belongs to this workspace.
    const validMembers = await WorkspaceMember.find({
      workspace: id,
      user: { $in: participantIds },
    });

    if (validMembers.length !== participantIds.length) {
      return res.status(400).json({
        message: "One or more participants are not members of this workspace",
      });
    }

    const task = await WorkspaceTask.create({
      workspace: id,
      createdBy: req.user.id,
      participants: participantIds,
      title: title.trim(),
      description: description?.trim() || "",
      priority: priority || "medium",
      dueDate: dueDate || null,
    });

    return res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Create workspace task error:", error);

    return res.status(500).json({
      message: "Failed to create workspace task",
    });
  }
};


export const getWorkspaceTasks = async (req, res) => {
  try {
    const { id } = req.params;

    // First verify that the user belongs to the workspace.
    const membership = await WorkspaceMember.findOne({
      workspace: id,
      user: req.user.id,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // Only return tasks where the current user is a participant.
    const tasks = await WorkspaceTask.find({
      workspace: id,
      participants: req.user.id,
    })
      .populate("createdBy", "name email")
      .populate("participants", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      tasks,
    });
  } catch (error) {
    console.error("Get workspace tasks error:", error);

    return res.status(500).json({
      message: "Failed to fetch workspace tasks",
    });
  }
};


export const getWorkspaceTask = async (req, res) => {
  try {
    const { id, taskId } = req.params;

    // First verify that the user belongs to the workspace.
    const membership = await WorkspaceMember.findOne({
      workspace: id,
      user: req.user.id,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // Find the task only if the current user is a participant.
    const task = await WorkspaceTask.findOne({
      _id: taskId,
      workspace: id,
      participants: req.user.id,
    })
      .populate("createdBy", "name email")
      .populate("participants", "name email");

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.status(200).json({
      task,
    });
  } catch (error) {
    console.error("Get workspace task error:", error);

    return res.status(500).json({
      message: "Failed to fetch task",
    });
  }
};

export const updateWorkspaceTask = async (req, res) => {
  try {
    const { id, taskId } = req.params;

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      participants,
    } = req.body;

    // Verify workspace membership first.
    const membership = await WorkspaceMember.findOne({
      workspace: id,
      user: req.user.id,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // Find the task and make sure the current user is a participant.
    const task = await WorkspaceTask.findOne({
      _id: taskId,
      workspace: id,
      participants: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const isCreator =
      task.createdBy.toString() === req.user.id;

    /*
     * Any participant can update status.
     */
    if (status !== undefined) {
      const allowedStatuses = [
        "pending",
        "in_progress",
        "completed",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid task status",
        });
      }

      task.status = status;
    }

    /*
     * Only the creator can modify task details.
     */
    const detailFieldsProvided =
      title !== undefined ||
      description !== undefined ||
      priority !== undefined ||
      dueDate !== undefined ||
      participants !== undefined;

    if (detailFieldsProvided && !isCreator) {
      return res.status(403).json({
        message: "Only the task creator can modify task details",
      });
    }

    if (isCreator) {
      if (title !== undefined) {
        if (!title.trim()) {
          return res.status(400).json({
            message: "Task title cannot be empty",
          });
        }

        task.title = title.trim();
      }

      if (description !== undefined) {
        task.description = description.trim();
      }

      if (priority !== undefined) {
        const allowedPriorities = [
          "low",
          "medium",
          "high",
        ];

        if (!allowedPriorities.includes(priority)) {
          return res.status(400).json({
            message: "Invalid task priority",
          });
        }

        task.priority = priority;
      }

      if (dueDate !== undefined) {
        task.dueDate = dueDate || null;
      }

      /*
       * If participants are being changed,
       * every participant must belong to this workspace.
       */
      if (participants !== undefined) {
        if (!Array.isArray(participants)) {
          return res.status(400).json({
            message: "Participants must be an array",
          });
        }

        const participantIds = [
          ...new Set([
            req.user.id,
            ...participants.map((userId) =>
              userId.toString()
            ),
          ]),
        ];

        const validMembers = await WorkspaceMember.find({
          workspace: id,
          user: { $in: participantIds },
        });

        if (validMembers.length !== participantIds.length) {
          return res.status(400).json({
            message:
              "One or more participants are not members of this workspace",
          });
        }

        task.participants = participantIds;
      }
    }

    await task.save();

    const updatedTask = await WorkspaceTask.findById(task._id)
      .populate("createdBy", "name email")
      .populate("participants", "name email");

    return res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update workspace task error:", error);

    return res.status(500).json({
      message: "Failed to update task",
    });
  }
};



export const deleteWorkspaceTask = async (req, res) => {
  try {
    const { id, taskId } = req.params;

    // Verify workspace membership.
    const membership = await WorkspaceMember.findOne({
      workspace: id,
      user: req.user.id,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // Find the task only if the current user is a participant.
    const task = await WorkspaceTask.findOne({
      _id: taskId,
      workspace: id,
      participants: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Only the creator can delete the task.
    if (task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the task creator can delete this task",
      });
    }

    await WorkspaceTask.deleteOne({
      _id: task._id,
    });

    return res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete workspace task error:", error);

    return res.status(500).json({
      message: "Failed to delete task",
    });
  }
};