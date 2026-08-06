import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    email: String,

    phone: String,

    billingCycle: {
      type: String,
      enum: ["Monthly", "Quarterly", "Yearly"],
      default: "Quarterly",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Client", clientSchema);