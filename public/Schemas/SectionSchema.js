const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    section: {
        type: String,
        required: true
    },
    subsections: {
        type: [String],
        set: arr => [...new Set(arr.map(v => v.trim()))]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

sectionSchema.index({ section: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);
