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
    // Fetch all feedback for the given eventId
    const feedbacks = await EventFeedback.find({ eventId });

    // Check if there is no feedback for the event
    if (feedbacks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No feedback found for this event.',
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

// exports.getAllReviews = async (req, res) => {
//   console.log("getAllReviews touched");

//   try {
//     // Fetch all EventFeedback entries and populate eventId with corresponding CalendarEvent data
//     const reviews = await EventFeedback.find()
//       .populate('eventId', 'date title description startDate endDate image location audience')  // Populate eventId with CalendarEvent fields
//       .sort({ eventId: 1 }); // Sort by eventId in ascending order

//     // If no reviews are found
//     if (!reviews || reviews.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'No reviews found.',
//       });
//     }

//     // Return the reviews with populated CalendarEvent data
//     res.status(200).json({
//       success: true,
//       reviews,
//     });
//   } catch (error) {
//     console.error('Error fetching event feedback:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error. Failed to fetch reviews.',
//     });
//   }
// };


// Fetch All Reviews Controller
const mongoose = require('mongoose');






