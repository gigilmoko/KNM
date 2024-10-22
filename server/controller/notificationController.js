const Notification = require('../models/notification');

exports.getNotifications = async (req, res) => {
    const userId = req.user.id; // Assuming you're using some form of authentication
  
    try {
      // Find all notifications for the user and populate event details
      const notifications = await Notification.find({ user: userId })
        .populate('event', 'title startDate endDate') // Populate event details
        .sort({ createdAt: -1 });
  
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error });
    }
  };
  
  // Mark a notification as read
  exports.markNotificationAsRead = async (req, res) => {
    const notifId = req.params.id;
  
    try {
      const notification = await Notification.findById(notifId);
      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }
  
      notification.read = true;
      await notification.save();
  
      res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error });
    }
  };

  exports.getUnreadNotificationsCount = async (req, res) => {
    const userId = req.user.id; // Assuming you're using authentication middleware

    try {
        // Count notifications for this user that are not read
        const unreadCount = await Notification.countDocuments({ user: userId, read: false });
        res.status(200).json({ success: true, unreadCount });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
};

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

// Get unread notifications count


  