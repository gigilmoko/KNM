const mongoose = require('mongoose');
const Notification = require('../models/notification');
const User = require('../models/user');
const CalendarEvent = require('../models/calendar');
const axios = require('axios');
require('dotenv').config();


const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY
// console.log('ONESIGNAL_APP_ID:', ONESIGNAL_APP_ID);


exports.createNotification = async (req, res) => {
  const { eventId } = req.body;


  try {
    // Input validation
    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }


    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }


    // Fetch event with error handling
    const event = await CalendarEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }


    // Get target users based on audience
    const users = await User.find(
      event.audience === 'all'
        ? {}
        : { role: { $in: ['member', 'admin'] }}
    );


    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: 'No users found to notify'
      });
    }


    // Create in-app notifications
    const notifications = await Promise.all(
      users.map(user =>
        Notification.create({
          user: user._id,
          event: event._id,
          read: false,
          title: event.title,
          message: `Event scheduled from ${new Date(event.startDate).toLocaleString()} to ${new Date(event.endDate).toLocaleString()} at ${event.location}.`
        })
      )
    );


    // Prepare OneSignal notification
    const oneSignalPayload = {
      app_id: ONESIGNAL_APP_ID,
      included_segments: event.audience === 'all' ? ['All'] : undefined,
      filters: event.audience === 'member' ? [
        { field: 'tag', key: 'role', relation: '=', value: 'member' },
        { field: 'tag', key: 'role', relation: '=', value: 'admin' }
      ] : undefined,
      headings: {
        en: `New Event: ${event.title}`
      },
      contents: {
        en: `Event "${event.title}" scheduled at ${event.location}`
      },
      subtitle: {
        en: `From ${new Date(event.startDate).toLocaleString()} to ${new Date(event.endDate).toLocaleString()}`
      },
      data: {
        eventId: event._id,
        type: 'event_notification'
      },
      big_picture: event.image || undefined,
      ios_attachments: event.image ? { id1: event.image } : undefined,
      priority: 10
    };


    // Send OneSignal notification
    const oneSignalResponse = await axios.post(
      'https://onesignal.com/api/v1/notifications',
      oneSignalPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ONESIGNAL_API_KEY}`
        }
      }
    );


    return res.status(200).json({
      success: true,
      message: 'Notifications sent successfully',
      data: {
        inAppNotifications: notifications.length,
        pushNotification: oneSignalResponse.data,
      }
    });


  } catch (error) {
    console.error('Notification Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send notifications',
      error: error.response?.data || error.message
    });
  }
};

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

exports.toggleNotificationReadStatus = async (req, res) => {
  // console.log("toggleNotif Hit")
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

exports.getUnreadNotificationsCount = async (req, res) => {
  const userId = req.user.id; // Assuming you're using authentication middleware

  try {
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
