const Notification = require("../models/Notification");

// @desc    Get all notifications
// @route   GET /api/admin/notifications
// @access  Private (Admin only)
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      order: [["createdAt", "DESC"]],
      limit: 50, // Keep it to recent 50 for performance
    });

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
    });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/admin/notifications/:id/read
// @access  Private (Admin only)
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating notification",
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/admin/notifications/read-all
// @access  Private (Admin only)
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { isRead: false } });

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating notifications",
    });
  }
};
