const Feedback = require('../models/feedback'); // Adjust the path to your Feedback model

// Add new feedback
exports.newFeedback = async (req, res, next) => {
    try {
        const { rating, feedback } = req.body;

        // Ensure all required fields are provided
        if (!rating || !feedback) {
            return res.status(400).json({
                success: false,
                message: 'Rating and feedback are required.'
            });
        }

        // Create new feedback with userId embedded from the authenticated user
        const newFeedback = await Feedback.create({
            userId: req.user.id, // Assuming you have middleware setting req.user
            rating,
            feedback
        });

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully.',
            feedback: newFeedback
        });
    } catch (error) {
        next(error);
    }
};

// Get all feedback
exports.getAllFeedback = async (req, res, next) => {
    try {
        const feedbacks = await Feedback.find().populate('userId', 'name email'); // Populate user details if needed
        if (!feedbacks || feedbacks.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No feedback found.'
            });
        }

        res.status(200).json({
            success: true,
            count: feedbacks.length,
            feedbacks
        });
    } catch (error) {
        next(error);
    }
};
