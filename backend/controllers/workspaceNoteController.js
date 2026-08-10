import WorkspaceNote from "../models/WorkspaceNote.js";
import WorkspaceMember from "../models/WorkspaceMember.js";

export const createWorkspaceNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, participants = [] } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Note content is required",
      });
    }

    // Verify that the creator belongs to the workspace.
    const creatorMembership = await WorkspaceMember.findOne({
      workspace: id,
      user: req.user.id,
    });

    if (!creatorMembership) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // Always include the creator as a participant.
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
        message:
          "One or more participants are not members of this workspace",
      });
    }

    const note = await WorkspaceNote.create({
      workspace: id,
      createdBy: req.user.id,
      participants: participantIds,
      title: title?.trim() || "",
      content: content.trim(),
    });

    return res.status(201).json({
      message: "Note created successfully",
      note,
    });
  } catch (error) {
    console.error("Create workspace note error:", error);

    return res.status(500).json({
      message: "Failed to create workspace note",
    });
  }
};


export const getWorkspaceNotes = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify that the user belongs to the workspace.
    const membership = await WorkspaceMember.findOne({
      workspace: id,
      user: req.user.id,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // Only return notes where the current user is a participant.
    const notes = await WorkspaceNote.find({
      workspace: id,
      participants: req.user.id,
    })
      .populate("createdBy", "name email")
      .populate("participants", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      notes,
    });
  } catch (error) {
    console.error("Get workspace notes error:", error);

    return res.status(500).json({
      message: "Failed to fetch workspace notes",
    });
  }
};


export const getWorkspaceNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;

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

    // Only find the note if the current user is a participant.
    const note = await WorkspaceNote.findOne({
      _id: noteId,
      workspace: id,
      participants: req.user.id,
    })
      .populate("createdBy", "name email")
      .populate("participants", "name email");

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    return res.status(200).json({
      note,
    });
  } catch (error) {
    console.error("Get workspace note error:", error);

    return res.status(500).json({
      message: "Failed to fetch note",
    });
  }
};

export const updateWorkspaceNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;
    const { title, content, participants } = req.body;

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

    // Only participants can access the note.
    const note = await WorkspaceNote.findOne({
      _id: noteId,
      workspace: id,
      participants: req.user.id,
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    // Only the creator can modify the note.
    if (note.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the note creator can modify this note",
      });
    }

    if (title !== undefined) {
      note.title = title.trim();
    }

    if (content !== undefined) {
      if (!content.trim()) {
        return res.status(400).json({
          message: "Note content cannot be empty",
        });
      }

      note.content = content.trim();
    }

    if (participants !== undefined) {
      if (!Array.isArray(participants)) {
        return res.status(400).json({
          message: "Participants must be an array",
        });
      }

      // Always keep the creator as a participant.
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
          message:
            "One or more participants are not members of this workspace",
        });
      }

      note.participants = participantIds;
    }

    await note.save();

    const updatedNote = await WorkspaceNote.findById(note._id)
      .populate("createdBy", "name email")
      .populate("participants", "name email");

    return res.status(200).json({
      message: "Note updated successfully",
      note: updatedNote,
    });
  } catch (error) {
    console.error("Update workspace note error:", error);

    return res.status(500).json({
      message: "Failed to update note",
    });
  }
};


export const deleteWorkspaceNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;

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

    // User must also be a participant of the note.
    const note = await WorkspaceNote.findOne({
      _id: noteId,
      workspace: id,
      participants: req.user.id,
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    // Only the creator can delete the note.
    if (note.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the note creator can delete this note",
      });
    }

    await WorkspaceNote.deleteOne({
      _id: note._id,
    });

    return res.status(200).json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete workspace note error:", error);

    return res.status(500).json({
      message: "Failed to delete note",
    });
  }
};