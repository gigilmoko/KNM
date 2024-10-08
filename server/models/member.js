const mongoose = require('mongoose');

// Define the Member schema
const memberSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: true
  },
  lname: {
    type: String,
    required: true
  },
  memberId: {
    type: String,
    required: true,
    unique: true }
});

// Create the Member model
const Member = mongoose.model('Member', memberSchema);

module.exports = Member;
