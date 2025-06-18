const mongoose = require('mongoose');

const forecastSchema = new mongoose.Schema({
    year: Number,
    month: String,
    index: Number
}, { timestamps: true });

module.exports = mongoose.model('Forecast', forecastSchema);