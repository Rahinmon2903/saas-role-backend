import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    //for this id the message will be sent
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    //message
    message: {
      type: String,
      required: true,
    },
    //path
    link: {
      type: String,
    },
    //to mark as read or un read
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
