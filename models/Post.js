const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    excerpt: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author',
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['sustainability', 'development', 'technology', 'education']
    },
    image: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    }
}, {
    timestamps: true
});

// Create URL-friendly slugs from titles
postSchema.pre('save', function(next) {
    if (!this.isModified('title')) {
        return next();
    }
    this.slug = this.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    next();
});

module.exports = mongoose.model('Post', postSchema); 