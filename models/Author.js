const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    bio: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        trim: true
    },
    socialLinks: {
        twitter: String,
        linkedin: String,
        facebook: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Author', authorSchema); 