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

export const markAsRead = async (req, res) => {
  try {
    const notifications = await Notification.findOne({
        _id:req.params.id,
      user: req.user._id,
    });
    if (!notifications) {
      return res.status(404).json({ message: "Notification not found" });
    }
    notifications.isRead = true;
    await notifications.save();
    res.json({ message: "Notifications marked as read" });
  } catch {
    res.status(500).json({ message: "Failed to mark notifications as read" });
  }
};
