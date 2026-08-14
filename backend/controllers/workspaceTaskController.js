import mongoose from "mongoose";
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


    if (!Array.isArray(participants)) {
      return res.status(400).json({
        message: "Participants must be an array",
      });
    }

    if (participants.length === 0) {
      return res.status(400).json({
        message: "Please assign the task to at least one person",
      });
    }


    const creatorMembership = await WorkspaceMember.findOne({
      workspace: id,
      user: req.user.id,
    });

    if (!creatorMembership) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }


    const participantIds = [
      ...new Set(
        participants.map((userId) => userId.toString())
      ),
    ];

    const validMembers = await WorkspaceMember.find({
      workspace: id,
      user: {
        $in: participantIds,
      },
    });

    if (validMembers.length !== participantIds.length) {
      return res.status(400).json({
        message:
          "One or more selected users are not members of this workspace",
      });
    }

    const allowedPriorities = [
      "low",
      "medium",
      "high",
    ];

    const taskPriority = priority || "medium";

    if (!allowedPriorities.includes(taskPriority)) {
      return res.status(400).json({
        message: "Invalid task priority",
      });
    }

    const task = await WorkspaceTask.create({
      workspace: id,

      // Person who created the task
      createdBy: req.user.id,

      // ONLY selected people
      participants: participantIds,

      title: title.trim(),

      description:
        description?.trim() || "",

      priority: taskPriority,

      dueDate: dueDate || null,
    });


    const populatedTask =
      await WorkspaceTask.findById(task._id)
        .populate("createdBy", "name email")
        .populate("participants", "name email");

    return res.status(201).json({
      message: "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    console.error(
      "Create workspace task error:",
      error
    );

    return res.status(500).json({
      message: "Failed to create workspace task",
    });
  }
};


export const getWorkspaceTasks = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify workspace membership
    const membership = await WorkspaceMember.findOne({
      workspace: id,
      user: req.user.id,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    const tasks = await WorkspaceTask.find({
      workspace: id,
      $or: [
        {
          createdBy: req.user.id,
        },
        {
          participants: req.user.id,
        },
      ],
    })
      .populate("createdBy", "name email")
      .populate("participants", "name email")
      .sort({
        status: 1,
        createdAt: -1,
      });

    return res.status(200).json({
      tasks,
    });
  } catch (error) {
    console.error(
      "Get workspace tasks error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch workspace tasks",
    });
  }
};


export const getWorkspaceTask = async (req, res) => {
  try {
    const { id, taskId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(taskId)
    ) {
      return res.status(400).json({
        message: "Invalid workspace or task id",
      });
    }


    const membership = await WorkspaceMember.findOne({
      workspace: id,
      user: req.user.id,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }


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
    console.error(
      "Get workspace task error:",
      error
    );

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

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(taskId)
    ) {
      return res.status(400).json({
        message: "Invalid workspace or task id",
      });
    }

    const membership = await WorkspaceMember.findOne({
      workspace: id,
      user: req.user.id,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }


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
      task.createdBy.toString() ===
      req.user.id.toString();



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


      const isAssigned =
        task.participants.some(
          (participantId) =>
            participantId.toString() ===
            req.user.id.toString()
        );

      if (
        status === "completed" &&
        !isAssigned
      ) {
        return res.status(403).json({
          message:
            "Only a person assigned to this task can mark it as completed",
        });
      }

      task.status = status;
    }


    const detailFieldsProvided =
      title !== undefined ||
      description !== undefined ||
      priority !== undefined ||
      dueDate !== undefined ||
      participants !== undefined;


    if (
      detailFieldsProvided &&
      !isCreator
    ) {
      return res.status(403).json({
        message:
          "Only the task creator can modify task details",
      });
    }


    if (isCreator) {

      if (title !== undefined) {
        if (
          typeof title !== "string" ||
          !title.trim()
        ) {
          return res.status(400).json({
            message:
              "Task title cannot be empty",
          });
        }

        task.title = title.trim();
      }

      if (description !== undefined) {
        task.description =
          typeof description === "string"
            ? description.trim()
            : "";
      }

      if (priority !== undefined) {
        const allowedPriorities = [
          "low",
          "medium",
          "high",
        ];

        if (
          !allowedPriorities.includes(
            priority
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid task priority",
          });
        }

        task.priority = priority;
      }


      if (dueDate !== undefined) {
        task.dueDate =
          dueDate || null;
      }


      if (participants !== undefined) {
        if (!Array.isArray(participants)) {
          return res.status(400).json({
            message:
              "Participants must be an array",
          });
        }


        const participantIds = [
          ...new Set([
            req.user.id.toString(),
            ...participants.map(
              (userId) =>
                userId.toString()
            ),
          ]),
        ];

        const validMembers =
          await WorkspaceMember.find({
            workspace: id,
            user: {
              $in: participantIds,
            },
          });

        if (
          validMembers.length !==
          participantIds.length
        ) {
          return res.status(400).json({
            message:
              "One or more selected users are not members of this workspace",
          });
        }

        task.participants =
          participantIds;
      }
    }


    await task.save();

    const updatedTask =
      await WorkspaceTask.findById(
        task._id
      )
        .populate(
          "createdBy",
          "name email"
        )
        .populate(
          "participants",
          "name email"
        );

    return res.status(200).json({
      message:
        "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error(
      "Update workspace task error:",
      error
    );

    return res.status(500).json({
      message: "Failed to update task",
    });
  }
};


export const deleteWorkspaceTask = async (
  req,
  res
) => {
  try {
    const { id, taskId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(taskId)
    ) {
      return res.status(400).json({
        message: "Invalid workspace or task id",
      });
    }

    const membership =
      await WorkspaceMember.findOne({
        workspace: id,
        user: req.user.id,
      });

    if (!membership) {
      return res.status(403).json({
        message:
          "You are not a member of this workspace",
      });
    }

    const task =
      await WorkspaceTask.findOne({
        _id: taskId,
        workspace: id,
        participants: req.user.id,
      });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (
      task.createdBy.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        message:
          "Only the task creator can delete this task",
      });
    }

    await WorkspaceTask.deleteOne({
      _id: task._id,
    });

    return res.status(200).json({
      message:
        "Task deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete workspace task error:",
      error
    );

    return res.status(500).json({
      message: "Failed to delete task",
    });
  }
};