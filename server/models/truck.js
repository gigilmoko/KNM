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
<<<<<<< Updated upstream
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
=======
    inUse: {
      type: Boolean,
      default: false,  
>>>>>>> Stashed changes
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Truck', truckSchema);
