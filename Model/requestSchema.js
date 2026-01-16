import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    // title of the request
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // description of the request
    description: {
      type: String,
      required: true,
      trim: true,
    },

     // status of the request
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // user who created the request
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // user who is responsible for the request
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

   //comments
    remark: {
      type: String,
      default: "",
      trim: true,
    },
    //history (to keep track of the request life cycle)
    history: [
      {
        //created, assigned, approved, rejected 1)staged created, 2)assigned, 3)approved, 4)rejected
        action: {
          type: String,
          enum: ["created", "assigned", "approved", "rejected"],
          required: true,
        },
        //user who performed the action 1)User who created the request, 2)admin who assigned the request, 3)manager who approved the request, 4)manager who rejected the request
        by: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        //comments
        remark: {
          type: String,
          default: "",
          trim: true,
        },
        //timestamp
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
