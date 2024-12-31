const mongoose = require("mongoose");

const paymongoTokenSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    verificationTokenExpire: {
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model("PaymongoToken", paymongoTokenSchema);