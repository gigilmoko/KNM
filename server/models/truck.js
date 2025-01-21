const mongoose = require('mongoose');
const Order = require('./order');
require('dotenv').config({ path: './config/config.env' });

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
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rider',
      default: null,
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',  
      },
    ],  
    riderAccepted: {
      type: String,
      enum: ['accepted', 'rejected', 'pending'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Truck', truckSchema);