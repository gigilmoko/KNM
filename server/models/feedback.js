const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1, 
        max: 5  
    },
    feedback: {
        type: String,
        required: false,
        trim: true,
        maxlength: 500 
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Feedback', feedbackSchema);
