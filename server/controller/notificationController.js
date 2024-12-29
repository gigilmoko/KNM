const mongoose = require('mongoose');
const Notification = require('../models/notification');
const User = require('../models/user');
const CalendarEvent = require('../models/calendar');
const axios = require('axios');
require('dotenv').config();

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY
console.log('ONESIGNAL_APP_ID:', ONESIGNAL_APP_ID);

exports.createNotification = async (req, res) => {
    const { eventId } = req.body;

    try {
        console.log('Received event ID:', eventId);

        // Ensure eventId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            console.error('Invalid event ID:', eventId);
            throw new Error('Invalid event ID');
        }

        // Fetch event details using the event ID
        const event = await CalendarEvent.findById(eventId);
        if (!event) {
            console.error('Event not found for ID:', eventId);
            throw new Error('Event not found');
        }

        console.log('Event details fetched for notification:', event);

        // Determine the audience
        const users = event.audience === 'all'
            ? await User.find() // Fetch all users
            : await User.find({ role: 'member' }); // Fetch only members

        // console.log(`Users to notify (${users.length}):`, users);

        // Create notifications for each user
        const notificationPromises = users.map(async (user) => {
            return Notification.create({
                user: user._id,
                event: event._id,
                read: false,
            });
        });

        await Promise.all(notificationPromises);

        console.log('In-app notifications created successfully');

        // Prepare push notification data
        const oneSignalNotification = {
            app_id: ONESIGNAL_APP_ID,
            included_segments: event.audience === 'all' ? ['All'] : undefined,
            filters: event.audience === 'member'
                ? [{ field: 'tag', key: 'role', relation: '=', value: 'member' }]
                : undefined,
            headings: { en: `New Event: ${event.title}` },
            contents: { en: `The event "${event.title}" is scheduled from ${event.startDate} to ${event.endDate} at ${event.location}.` },
            data: { eventId: event._id },
            big_picture: event.image || null, // For Android
            ios_attachments: { id1: event.image || null }, // For iOS
        };

        console.log('OneSignal notification payload:', oneSignalNotification);

        // Send notification via OneSignal
        await axios.post(
            'https://onesignal.com/api/v1/notifications',
            oneSignalNotification,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ONESIGNAL_API_KEY}`,
                },
            }
        );

        console.log('Push notifications sent successfully via OneSignal');
        res.status(200).json({ success: true, message: 'Notifications sent successfully' });
    } catch (error) {
        console.error('Error sending notifications:', error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: 'Failed to send notifications', error: error.message });
    }
};

// Fetch all notifications for a user
exports.getNotifications = async (req, res) => {
  const userId = req.user.id; 
  
  try {
    const notifications = await Notification.find({ user: userId })
      .populate('event', 'title startDate endDate description') // Populate event details
      .sort({ createdAt: -1 });
  
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};


// Fetch all notifications for a user
// exports.getNotifications = async (req, res) => {
//   const userId = req.user.id; 
  
//   try {
//     const notifications = await Notification.find({ user: userId })
//       .populate('event', 'title startDate endDate') // Populate event details
//       .sort({ createdAt: -1 });
  
//     res.status(200).json(notifications);
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Server error', error });
//   }
// };

// Toggle the 'read' status of a notification
exports.toggleNotificationReadStatus = async (req, res) => {
  console.log("toggleNotif Hit")
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
