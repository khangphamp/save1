require('../database');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = mongoose.Schema({
    comment: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: 'Người dùng'
    }
}, {
    timestamps: true
})
let postSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    thumb:{
        type: String
    },
    isVideo: {
        type: Boolean,
        default: false
    },
    videoUrl: {
        type: String
    },
    content: {
        type: String
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Categories'
    },
    tags:[{
        type: Schema.Types.ObjectId,
        ref: 'Tags'
    }],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    numberOfReader:{
        type: Number,
        default: 0
    },
    status:{
        type: Number,
        default: 1
    },
    refId: {
        type: String,
        required: true
    },
    seo_keyfocus: {
        type: String,
        default: ''
    },
    seo_scores: {
        type: Number,
        default: 0,
    },
    canonical: {
        type: String,
    },
    faq: {
        type: String,
    },
    ratingList: {
        type:  [Number],
        default: [5]
    },
    ratingValue: {
        type: Number,
        default: 5,
    },
    comment: [commentSchema],
    createdTime: {
        type: Date,
        default: Date.now
    },
    updatedTime: {
        type: Date
    }
}, { versionKey: false });

postSchema.index({'title': 'text'});

module.exports = mongoose.model('Posts', postSchema)