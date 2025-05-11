const mongoose = require('mongoose');

const truckSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: true,
    },
    plateNo: {
      type: String,
      required: true,
      unique: true,
    },
   
  },
  { timestamps: true }
);

module.exports = mongoose.model('Truck', truckSchema);

