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
  console.log("GetUserInterested Hit")
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

exports.getUserInterestedAndAttended = async (req, res) => {
  console.log("GetUserInterestedAndAttended Hit");

  try {
    const { userId, eventId } = req.params; // Extract userId and eventId from the URL

    // Validate the userId and eventId (ensure they're valid ObjectIds)
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid user ID or event ID' });
    }

    // Find all interests for the specific user and event, including attendance status
    const interests = await UserInterest.find({ user: userId, event: eventId })
      .populate('user', 'fname lname email avatar')
      .lean();

    // if (!interests || interests.length === 0) {
    //   return res.status(404).json({ message: 'No users found for this event and user.' });
    // }

    // Separate users into interested and attended, with added status check
    const interestedUsers = interests.map(interest => {
      const user = {
        ...interest.user,
        interested: interest.interested,
        isAttended: interest.isAttended,
      };

      // Log the status based on interested and attended
      if (user.interested && !user.isAttended) {
        console.log(`${user.fname} ${user.lname} is interested but has not attended.`);
      } else if (!user.interested && user.isAttended) {
        console.log(`${user.fname} ${user.lname} has attended but was not marked as interested.`);
      } else if (user.interested && user.isAttended) {
        console.log(`${user.fname} ${user.lname} is both interested and has attended.`);
      }

      // Add a 'status' field that will be false if either interested or attended is false
      user.status = user.interested && user.isAttended;

      return user;
    });

    // Separate attended users (those who are interested and have attended)
    const attendedUsers = interestedUsers.filter(user => user.isAttended);

    res.status(200).json({
      message: 'Users interested and attended retrieved successfully.',
      interestedUsers,
      attendedUsers,
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

    // Find all interests for the specific event, populate user details
    const interests = await UserInterest.find({ event: eventId })
      .populate('user', 'fname lname email avatar');  // Populate user details

    if (!interests || interests.length === 0) {
      return res.status(404).json({ message: 'No users are interested in this event.' });
    }

    // Map through the interests and include both user details and isAttended
    const interestedUsers = interests.map(interest => ({
      userId: interest.user._id,
      fname: interest.user.fname,
      lname: interest.user.lname,
      email: interest.user.email,
      avatar: interest.user.avatar,
      interested: interest.interested,
      isAttended: interest.isAttended,  // Fetching from UserInterest schema
    }));

    res.status(200).json({
      message: 'Users interested in the event retrieved successfully.',
      interestedUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.changeAttended = async (req, res) => {
  try {
    const { userId, eventId } = req.body;

    // Find the user's interest in the event
    const userInterest = await UserInterest.findOne({ user: userId, event: eventId });

    if (!userInterest) {
      return res.status(404).json({ message: 'User interest not found for the given event.' });
    }

    // Toggle the isAttended field
    userInterest.isAttended = !userInterest.isAttended;
    await userInterest.save();

    res.status(200).json({
      message: `Attendance status changed successfully to ${userInterest.isAttended ? 'attended' : 'not attended'}.`,
      userInterest
    });
  } catch (error) {
    console.error('Error changing attendance status:', error);
    res.status(500).json({ message: 'Server error. Unable to change attendance status.' });
  }
};