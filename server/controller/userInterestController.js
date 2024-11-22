const UserInterest = require('../models/userInterest');
const mongoose = require('mongoose');
const Notification = require('../models/notification');
const CalendarEvent = require('../models/calendar');
const User = require('../models/user');
const schedule = require('node-schedule'); // Import node-schedule

// Function to schedule notification 24 hours before the event
const scheduleEventNotification = async (userId, event) => {
  // Calculate notification date (24 hours before the event start date)
  const notificationDate = new Date(event.startDate); // Use startDate
  notificationDate.setHours(notificationDate.getHours() - 24); // Subtract 24 hours

  // Schedule the notification
  schedule.scheduleJob(notificationDate, async () => {
    // Check if the user is still interested in the event before sending notification
    const interestExists = await UserInterest.findOne({ user: userId, event: event._id });
    if (interestExists) {
      await Notification.create({
        user: userId,
        event: event._id,
        title: `Reminder: ${event.title} is happening soon!`,
        description: `The event "${event.title}" is starting in 24 hours.`,
        eventDate: event.startDate, // Use startDate for the event date in notification
      });
      console.log(`Notification sent to user ${userId} for event ${event.title}`);
    } else {
      console.log(`User ${userId} is no longer interested in event ${event.title}. Notification not sent.`);
    }
  });
};

// Function to express interest in an event
exports.expressInterest = async (req, res) => {
  console.log('expressInterest Hit'); // Log user data for debugging
  try {
    // Log the current date and time
    const currentTime = new Date();
    console.log('Current time:', currentTime.toISOString()); // Log current time in ISO format

    console.log('User data:', req.user); // Log user data for debugging
    const { eventId } = req.body; // Get event ID from request body
    const userId = req.user.id; // Assuming user ID is available in req.user after authentication

    // Check if the user is already interested in the event
    const existingInterest = await UserInterest.findOne({ user: userId, event: eventId });

    if (existingInterest) {
      return res.status(400).json({ message: 'You are already interested in this event.' });
    }

    // Find the event to notify users
    const event = await CalendarEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Create a new user interest
    await UserInterest.create({ user: userId, event: eventId });

    // Create a notification for the user immediately
    await Notification.create({
      user: userId,
      event: eventId,
      title: `Interest in ${event.title}`,
      description: `You have expressed interest in the event: ${event.title}.`,
      eventDate: event.date,
    });

    // Schedule a notification for 24 hours before the event
    await scheduleEventNotification(userId, event);

    res.status(200).json({ message: 'Interest expressed successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user interest for a specific event
exports.getUserInterest = async (req, res) => {
  try {
    const { userId, eventId } = req.params; // Extract userId and eventId from the URL

    // Check if the user has expressed interest in the event
    const interest = await UserInterest.findOne({ user: userId, event: eventId });

    if (!interest) {
      return res.status(404).json({ message: 'Interest not found.' });
    }

    // Find the event details
    const event = await CalendarEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    res.status(200).json({
      message: 'Interest found.',
      interest,
      event
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getAllInterestedUsers = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Validate the eventId (ensure it's a valid ObjectId)
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    // Find all interests for the specific event
    const interests = await UserInterest.find({ event: eventId }).populate('user', 'fname lname email avatar');

    if (!interests || interests.length === 0) {
      return res.status(404).json({ message: 'No users are interested in this event.' });
    }

    // Map through the interests and return the user details
    const interestedUsers = interests.map(interest => interest.user);

    res.status(200).json({
      message: 'Users interested in the event retrieved successfully.',
      interestedUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
