const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
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
        enum: ["Preparing", "Shipped", "Delivered"],
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
});

module.exports = mongoose.model('Order', orderSchema);