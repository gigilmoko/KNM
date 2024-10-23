const Notification = require('../models/notification');

// Fetch all notifications for a user
exports.getNotifications = async (req, res) => {
  const userId = req.user.id; // Assuming you're using some form of authentication
  
  try {
    const notifications = await Notification.find({ user: userId })
      .populate('event', 'title startDate endDate') // Populate event details
      .sort({ createdAt: -1 });
  
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Toggle the 'read' status of a notification
exports.toggleNotificationReadStatus = async (req, res) => {
  const notifId = req.params.id;
  
  try {
    const notification = await Notification.findById(notifId);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Toggle the 'read' status
    notification.read = !notification.read;
    await notification.save();
  
    res.status(200).json({ success: true, message: `Notification marked as ${notification.read ? 'read' : 'unread'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Get count of unread notifications
exports.getUnreadNotificationsCount = async (req, res) => {
  const userId = req.user.id; // Assuming you're using authentication middleware

  try {
    const unreadCount = await Notification.countDocuments({ user: userId, read: false });
    res.status(200).json({ success: true, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  const notifId = req.params.id;

  try {
    const notification = await Notification.findByIdAndDelete(notifId);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

exports.deleteAllNotifications = async (req, res) => {
  const userId = req.user.id; // Assuming you're using authentication middleware

  try {
    const result = await Notification.deleteMany({ user: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'No notifications found to delete' });
    }

    res.status(200).json({ success: true, message: 'All notifications deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
