require('../database');
const mongoose = require('mongoose');
const { Schema } = mongoose;

let categorySchema = new Schema({
    categoryName:{
        type: String,
        required: true,
    },
    categorySlug:{
        type: String,
        required: true,
        unique: true
    },
    content: {
        type: String
    },
    categoryOrder: {
        type: Number,
        default: 99
    },
    createdTime: {
        type: Date,
        default: Date.now
    },
    updatedTime: {
        type: Date
    },
    isShow: {
        type: Boolean,
        default: true
    },
    type: {
        type: String,
        default: null
    },
    canonical: {
        type: String,
    },
    faq: {
        type: String,
    },
    seo_title: {
        type: String
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    }
}, { versionKey: false });

categorySchema.index({'categoryName': 'text'});

module.exports = mongoose.model('Categories', categorySchema)