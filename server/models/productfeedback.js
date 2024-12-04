const mongoose = require('mongoose');

const productFeedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    feedback: {
        type: String,
        required: false,
        trim: true,
        maxlength: 500,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('ProductFeedback', productFeedbackSchema);
