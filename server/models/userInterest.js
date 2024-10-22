const mongoose = require('mongoose');

// Define the schema for user interests
const userInterestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CalendarEvent',
    required: true,
  },
  interested: {
    type: Boolean,
    default: true, // Default to true if the user is interested
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Create the model from the schema
const UserInterest = mongoose.model('UserInterest', userInterestSchema);

module.exports = UserInterest;
