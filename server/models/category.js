const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter category name'],
        trim: true,
        maxLength: [100, 'category name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please enter category description'],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Category', categorySchema);