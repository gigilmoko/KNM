const mongoose = require('mongoose');

// Define the schema for notifications
const notificationSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  read: {
    type: Boolean,
    default: false,
  },
  eventDate: {
    type: Date,
    required: true,
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Notification', notificationSchema);
