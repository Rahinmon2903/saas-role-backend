import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
   
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

 
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

   
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

   
    remark: {
      type: String,
      default: "",
      trim: true,
    },

    history: [
      {
        action: {
          type: String,
          enum: ["created", "assigned", "approved", "rejected"],
          required: true,
        },
        by: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        remark: {
          type: String,
          default: "",
          trim: true,
        },
        at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, 
  }
);

const Request = mongoose.model("Request", requestSchema);
export default Request;
