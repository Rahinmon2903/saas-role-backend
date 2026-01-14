import Notification from "../Model/notificationSchema.js";

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(notifications);
  } catch {
    res.status(500).json({ message: "Failed to load notifications" });
  }
};
