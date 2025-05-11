const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    KNMOrderId:{
        type: String,
        required: true,
    },
    orderProducts: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "Product",
            },
            quantity: {
                type: Number,
                default: 1,
            },
            price: {
                type: Number,
                required: true,
            },
        },
    ],

    paymentInfo: {
        type: String,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    shippingCharges: {
        type: Number,
        required: true,
        default: 10,
    },
    status: {
        type: String,
        enum: ["Preparing", "Shipped", "Delivered", "Delivered Pending", "Cancelled"],
        default: "Preparing",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    assignedAlready: {
        type: Boolean,
        default: false,
    },
    proofOfDelivery: {
        type: String,
        default: null, // Use null for cases where proof is not yet available
    },
});

module.exports = mongoose.model('Order', orderSchema);