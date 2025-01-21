const mongoose = require('mongoose');

const forecastSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    forecastedDemand: {
        type: Number,
        required: true,
    },
    forecastDate: {
        type: Date,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Forecast', forecastSchema);