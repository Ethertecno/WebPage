const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    section: {
        type: String,
        required: true
    },
    subsection: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        maxlength: 500
    },
    briefDescription: {
        type: String
    },
    specifications: [
        {
            section: String,
            items: [
                {
                    key: String,
                    value: String
                }
            ]
        }
    ],
    mainImage: {
        type: String, // filename of the main image
        required: true
    },
    additionalImages: {
        type: [String], // array of filenames for extra images
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);
