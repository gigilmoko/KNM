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

    deliveryAddress: {
        houseNo: {
            type: String,
        },
        streetName: {
            type: String,
        },
        barangay: {
            type: String,
        },
        city: {
            type: String,
        },
        latitude: {
            type: Number,
            default: 0,
        },
        longitude: {
            type: Number,
            default: 0,
        },
    },
    
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
    insideTruck: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model('Order', orderSchema);