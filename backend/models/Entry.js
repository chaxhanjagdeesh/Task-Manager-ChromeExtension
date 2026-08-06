import mongoose from "mongoose";

const entrySchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["note", "expense", "payment", "todo"],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    amount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },

    isBilled: {
      type: Boolean,
      default: false,
    },

    isCut: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Entry", entrySchema);