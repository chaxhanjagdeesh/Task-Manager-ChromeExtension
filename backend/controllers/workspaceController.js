import Workspace from "../models/Workspace.js";
import WorkspaceMember from "../models/WorkspaceMember.js";
import Invitation from "../models/WorkspaceInvitation.js";
import User from "../models/User.js";

export const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Workspace name is required",
      });
    }

    const workspace = await Workspace.create({
      name: name.trim(),
      description: description?.trim() || "",
      createdBy: req.user.id,
    });

    await WorkspaceMember.create({
      workspace: workspace._id,
      user: req.user.id,
      role: "admin",
    });

    return res.status(201).json({
      message: "Workspace created successfully",
      workspace,
    });
  } catch (error) {
    console.error("Create workspace error:", error);

    return res.status(500).json({
      message: "Failed to create workspace",
    });
  }
};


export const getMyWorkspaces = async (req, res) => {
  try {
    const memberships = await WorkspaceMember.find({
      user: req.user.id,
    })
      .populate("workspace")
      .sort({ createdAt: -1 });

    const workspaces = memberships.map((membership) => ({
      _id: membership.workspace._id,
      name: membership.workspace.name,
      description: membership.workspace.description,
      createdBy: membership.workspace.createdBy,
      role: membership.role,
      joinedAt: membership.joinedAt,
      createdAt: membership.workspace.createdAt,
      updatedAt: membership.workspace.updatedAt,
    }));

    return res.status(200).json({
      workspaces,
    });
  } catch (error) {
    console.error("Get workspaces error:", error);

    return res.status(500).json({
      message: "Failed to fetch workspaces",
    });
  }
};


export const getWorkspace = async (req, res) => {
  try {
    const { id } = req.params;

    const membership = await WorkspaceMember.findOne({
      workspace: id,
      user: req.user.id,
    }).populate("workspace");

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    return res.status(200).json({
      workspace: {
        _id: membership.workspace._id,
        name: membership.workspace.name,
        description: membership.workspace.description,
        createdBy: membership.workspace.createdBy,
        role: membership.role,
        joinedAt: membership.joinedAt,
        createdAt: membership.workspace.createdAt,
        updatedAt: membership.workspace.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get workspace error:", error);

    return res.status(500).json({
      message: "Failed to fetch workspace",
    });
  }
};


export const getWorkspaceMembers = async (req, res) => {
  try {
    const { id } = req.params;

    // First verify that the current user belongs to this workspace
    const currentMembership = await WorkspaceMember.findOne({
      workspace: id,
      user: req.user.id,
    });

    if (!currentMembership) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // Get all members of the workspace
    const members = await WorkspaceMember.find({
      workspace: id,
    })
      .populate("user", "name email lastSeen")
      .sort({ role: 1, joinedAt: 1 });

    return res.status(200).json({
      members: members.map((member) => ({
        _id: member._id,
        user: member.user,
        role: member.role,
        joinedAt: member.joinedAt,
      })),
    });
  } catch (error) {
    console.error("Get workspace members error:", error);

    return res.status(500).json({
      message: "Failed to fetch workspace members",
    });
  }
};

export const createInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check that the current user belongs to this workspace.
    const membership = await WorkspaceMember.findOne({
      workspace: id,
      user: req.user.id,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // Only admins can invite users.
    if (membership.role !== "admin") {
      return res.status(403).json({
        message: "Only workspace admins can invite users",
      });
    }

    // The invited account MUST already exist.
    const invitedUser = await User.findOne({
      email: normalizedEmail,
    });

    if (!invitedUser) {
      return res.status(404).json({
        message:
          "No account exists with this email address",
      });
    }

    // Prevent inviting yourself.
    if (
      invitedUser._id.toString() ===
      req.user.id.toString()
    ) {
      return res.status(400).json({
        message: "You cannot invite yourself",
      });
    }

    // Check if the user is already a workspace member.
    const existingMembership =
      await WorkspaceMember.findOne({
        workspace: id,
        user: invitedUser._id,
      });

    if (existingMembership) {
      return res.status(409).json({
        message:
          "User is already a member of this workspace",
      });
    }

    // Prevent duplicate pending invitations.
    const existingInvitation =
      await Invitation.findOne({
        workspace: id,
        invitedUser: invitedUser._id,
        status: "pending",
      });

    if (existingInvitation) {
      return res.status(409).json({
        message:
          "An invitation is already pending for this user",
      });
    }

    // Invitation expires after 7 days.
    const expiresAt = new Date();

    expiresAt.setDate(
      expiresAt.getDate() + 7
    );

    const invitation =
      await Invitation.create({
        workspace: id,
        invitedBy: req.user.id,
        invitedUser: invitedUser._id,
        invitedEmail: normalizedEmail,
        status: "pending",
        expiresAt,
      });

    return res.status(201).json({
      message: "Invitation created successfully",
      invitation,
    });
  } catch (error) {
    console.error(
      "Create invitation error:",
      error
    );

    return res.status(500).json({
      message: "Failed to create invitation",
    });
  }
};
export const getMyInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({
      invitedUser: req.user.id,
      status: "pending",
      expiresAt: {
        $gt: new Date(),
      },
    })
      .populate("workspace", "name description")
      .populate("invitedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      invitations,
    });
  } catch (error) {
    console.error("Get invitations error:", error);

    return res.status(500).json({
      message: "Failed to fetch invitations",
    });
  }
};

export const acceptInvitation = async (req, res) => {
  try {
    const { id } = req.params;

    const invitation = await Invitation.findById(id);

    if (!invitation) {
      return res.status(404).json({
        message: "Invitation not found",
      });
    }

    // Make sure this invitation belongs to the current user.
    const isRecipient =
      invitation.invitedUser?.toString() === req.user.id ||
      invitation.invitedEmail === req.user.email.toLowerCase();

    if (!isRecipient) {
      return res.status(403).json({
        message: "You cannot accept this invitation",
      });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({
        message: "This invitation is no longer pending",
      });
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = "expired";
      await invitation.save();

      return res.status(400).json({
        message: "This invitation has expired",
      });
    }

    // Make sure the user isn't already a member.
    const existingMembership = await WorkspaceMember.findOne({
      workspace: invitation.workspace,
      user: req.user.id,
    });

    if (existingMembership) {
      invitation.status = "accepted";
      await invitation.save();

      return res.status(409).json({
        message: "You are already a member of this workspace",
      });
    }

    // Create normal user membership.
    const membership = await WorkspaceMember.create({
      workspace: invitation.workspace,
      user: req.user.id,
      role: "user",
    });

    invitation.status = "accepted";
    await invitation.save();

    return res.status(200).json({
      message: "Invitation accepted successfully",
      membership,
    });
  } catch (error) {
    console.error("Accept invitation error:", error);

    return res.status(500).json({
      message: "Failed to accept invitation",
    });
  }
};


export const rejectInvitation = async (req, res) => {
  try {
    const { id } = req.params;

    const invitation = await Invitation.findById(id);

    if (!invitation) {
      return res.status(404).json({
        message: "Invitation not found",
      });
    }

    const isRecipient =
      invitation.invitedUser?.toString() === req.user.id ||
      invitation.invitedEmail === req.user.email.toLowerCase();

    if (!isRecipient) {
      return res.status(403).json({
        message: "You cannot reject this invitation",
      });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({
        message: "This invitation is no longer pending",
      });
    }

    invitation.status = "rejected";
    await invitation.save();

    return res.status(200).json({
      message: "Invitation rejected successfully",
    });
  } catch (error) {
    console.error("Reject invitation error:", error);

    return res.status(500).json({
      message: "Failed to reject invitation",
    });
  }
};




export const getWorkspaceInvitations = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify current user is a workspace member
    const membership = await WorkspaceMember.findOne({
      workspace: id,
      user: req.user.id,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // Only admins should see pending invitations
    if (membership.role !== "admin") {
      return res.status(403).json({
        message:
          "Only workspace admins can view invitations",
      });
    }

    // Automatically ignore expired invitations
    const invitations = await Invitation.find({
      workspace: id,
      status: "pending",
      expiresAt: { $gt: new Date() },
    })
      .populate("invitedUser", "name email")
      .populate("invitedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      invitations,
    });
  } catch (error) {
    console.error(
      "Get workspace invitations error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch workspace invitations",
    });
  }
};



export const revokeInvitation = async (req, res) => {
  try {
    const { id, invitationId } = req.params;

    // Verify current user belongs to workspace
    const membership = await WorkspaceMember.findOne({
      workspace: id,
      user: req.user.id,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // Only admins can revoke invitations
    if (membership.role !== "admin") {
      return res.status(403).json({
        message:
          "Only workspace admins can revoke invitations",
      });
    }

    const invitation = await Invitation.findOne({
      _id: invitationId,
      workspace: id,
      status: "pending",
    });

    if (!invitation) {
      return res.status(404).json({
        message: "Pending invitation not found",
      });
    }

    await Invitation.deleteOne({
      _id: invitation._id,
    });

    return res.status(200).json({
      message: "Invitation revoked successfully",
    });
  } catch (error) {
    console.error(
      "Revoke invitation error:",
      error
    );

    return res.status(500).json({
      message: "Failed to revoke invitation",
    });
  }
};