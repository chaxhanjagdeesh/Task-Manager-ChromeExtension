import mongoose from "mongoose";

const workspaceMemberSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      required: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// A user can only be a member of the same workspace once.
workspaceMemberSchema.index(
  { workspace: 1, user: 1 },
  { unique: true }
);

const WorkspaceMember = mongoose.model(
  "WorkspaceMember",
  workspaceMemberSchema
);

export default WorkspaceMember;