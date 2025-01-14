const EventFeedback = require('../models/eventfeedback');
const UserInterest = require('../models/userInterest');  // Assuming this is the path to your UserInterest model
const CalendarEvent = require('../models/calendar');

// Create Feedback Controller
exports.createFeedback = async (req, res) => {
    const { userId, eventId, rating, description } = req.body;
  
    try {
      // Log the received data to console
      console.log('Received data:', req.body); // This will log the entire request body
  
      // Check if the user is interested in the event
      const userInterest = await UserInterest.findOne({
        user: userId,
        event: eventId,
        interested: true,
      });
  
      if (!userInterest) {
        return res.status(400).json({
          success: false,
          message: 'User is not interested in this event or not found in the interest list.',
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
  const { eventId } = req.params; // Extract the eventId from the URL parameters

  try {
    let feedbacks;
    if (eventId === "all") {
      // Fetch all feedbacks if eventId is "all"
      feedbacks = await EventFeedback.find();
    } else {
      // Fetch feedbacks for the given eventId
      feedbacks = await EventFeedback.find({ eventId });
    }

    // Check if there is no feedback
    if (feedbacks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No feedback found.',
      });
    }

    // Return the feedbacks
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

// Fetch All Feedback Events Controller
exports.getAllFeedbackEvents = async (req, res) => {
  try {
    // Use MongoDB aggregation to group feedback by eventId and calculate average rating
    const feedbackEvents = await EventFeedback.aggregate([
      {
        $group: {
          _id: '$eventId', // Group by eventId
          averageRating: { $avg: '$rating' }, // Calculate the average rating
        },
      },
      {
        $project: {
          eventId: '$_id', // Rename _id to eventId
          averageRating: 1,
          _id: 0, // Exclude the original _id field
        },
      },
    ]);

    // Check if there are no feedback events
    if (feedbackEvents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No feedback events found.',
      });
    }

    // Return grouped feedback events
    return res.status(200).json({
      success: true,
      message: 'Feedback events grouped and fetched successfully.',
      data: feedbackEvents,
    });
  } catch (error) {
    console.error('Error fetching feedback events:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to fetch feedback events.',
    });
  }
};

