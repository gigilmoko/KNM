const mongoose = require('mongoose');

const deliverySessionSchema = new mongoose.Schema(
  {
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rider',
      required: true,
    },
    truck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Truck',
      required: true,
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ['Undecided', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Undecided',
    },
    riderAccepted: {
      type: String,
      enum: ['Accepted', 'Rejected', 'Pending'], 
      default: 'Pending',
    },
    startTime: {
        type: Date,
        default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model('DeliverySession', deliverySessionSchema);
