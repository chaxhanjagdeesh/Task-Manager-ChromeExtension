import mongoose from "mongoose";

const workspaceNoteSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    title: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
  },
  {
    timestamps: true,
  }
);

workspaceNoteSchema.index({
  workspace: 1,
  participants: 1,
  createdAt: -1,
});

const WorkspaceNote = mongoose.model(
  "WorkspaceNote",
  workspaceNoteSchema
);

export default WorkspaceNote;