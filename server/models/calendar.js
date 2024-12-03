const mongoose = require('mongoose');

// Define the schema for a calendar event
const calendarEventSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  location: {
    type: String,
    required: true, // Assuming location is mandatory for an event
  },
  audience: {
    type: String,
    enum: ['all', 'member'], // Options for the audience
    required: true,
  },
}, {
  timestamps: true,
});

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);

module.exports = CalendarEvent;