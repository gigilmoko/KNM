const EventFeedback = require('../models/eventfeedback');
const UserInterest = require('../models/userInterest');
const CalendarEvent = require('../models/calendar');

// Create Feedback Controller
exports.createFeedback = async (req, res) => {
  const { userId, eventId, rating, description } = req.body;

  try {
    // Prevent duplicate feedback
    const existingFeedback = await EventFeedback.findOne({ userId, eventId });
    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted feedback for this event.',
      });
    }

    // Validate rating and description
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }
    if (!description || description.length < 5) {
      return res.status(400).json({ success: false, message: 'Description is too short.' });
    }

    // Check if the user is interested and has attended the event
    const userInterest = await UserInterest.findOne({
      user: userId,
      event: eventId,
      interested: true,
      isAttended: true,
    });

    if (!userInterest) {
      return res.status(400).json({
        success: false,
        message: 'User is not marked as attended for this event or is not interested.',
      });
    }

    // Create new feedback entry
    const newFeedback = new EventFeedback({
      userId,
      eventId,
      rating,
      description,
    });

    await newFeedback.save();

    return res.status(201).json({
      success: true,
      message: 'Feedback created successfully',
      data: newFeedback,
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to create feedback.',
    });
  }
};

// Fetch All Feedback Controller
exports.getEventFeedback = async (req, res) => {
  const { eventId } = req.params;
  try {
    let feedbacks;
    if (eventId === "all") {
      feedbacks = await EventFeedback.find()
        .populate('userId', 'fname middlei lname avatar')
        .populate('eventId', 'title date');
    } else {
      feedbacks = await EventFeedback.find({ eventId })
        .populate('userId', 'fname middlei lname avatar')
        .populate('eventId', 'title date');
    }
    return res.status(200).json({
      success: true,
      message: 'Feedback fetched successfully.',
      data: feedbacks,
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to fetch feedback.',
    });
  }
};

// Fetch All Feedback Controller for Mobile
exports.getEventFeedbackMobile = async (req, res) => {
  const { eventId } = req.params;
  try {
    let feedbacks;
    if (eventId === "all") {
      feedbacks = await EventFeedback.find()
        .populate('userId', 'fname middlei lname avatar');
    } else {
      feedbacks = await EventFeedback.find({ eventId })
        .populate('userId', 'fname middlei lname avatar');
    }
    return res.status(200).json({
      success: true,
      message: "Feedback fetched successfully.",
      data: feedbacks,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Failed to fetch feedback.",
    });
  }
};

// Fetch All Feedback Events Controller (grouped by event)
exports.getAllFeedbackEvents = async (req, res) => {
  try {
    const feedbackEvents = await EventFeedback.aggregate([
      {
        $group: {
          _id: '$eventId',
          averageRating: { $avg: '$rating' },
        },
      },
      {
        $project: {
          eventId: '$_id',
          averageRating: 1,
          _id: 0,
        },
      },
    ]);

    // Fetch event details for each eventId
    const enrichedFeedbackEvents = await Promise.all(
      feedbackEvents.map(async (event) => {
        const calendarEvent = await CalendarEvent.findOne({ _id: event.eventId })
          .select('date title description startDate endDate image');
        return {
          ...event,
          date: calendarEvent?.date || null,
          title: calendarEvent?.title || null,
          description: calendarEvent?.description || null,
          startDate: calendarEvent?.startDate || null,
          endDate: calendarEvent?.endDate || null,
          image: calendarEvent?.image || null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Feedback events grouped and fetched successfully.',
      data: enrichedFeedbackEvents,
    });
  } catch (error) {
    console.error('Error fetching feedback events:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to fetch feedback events.',
    });
  }
};