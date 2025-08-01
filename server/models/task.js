const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  members: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Changed from 'Member' to 'User'
    required: true,
  }],
  deadline: {
    type: Date,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);