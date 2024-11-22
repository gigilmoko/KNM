const mongoose = require('mongoose');

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
    default: true,
  }
}, {
  timestamps: true, 
});

const UserInterest = mongoose.model('UserInterest', userInterestSchema);

module.exports = UserInterest;
