const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // assuming you have a User model
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1, // Minimum rating value
        max: 5  // Maximum rating value
    },
    feedback: {
        type: String,
        required: false,
        trim: true,
        maxlength: 500 // Limit the feedback to 500 characters
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Feedback', feedbackSchema);
