require('../database');
const mongoose = require('mongoose');
const { Schema } = mongoose;

let menuSchema = new Schema({
    menuName:{
        type: String,
        required: true,
    },
    representCategory:{
        type: Schema.Types.ObjectId,
        ref: 'Categories',
        default: null
    },
    menuUrl:{
        type: String,
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Menus',
        default: null
    },
    children: [{
        type: Schema.Types.ObjectId,
        ref: 'Menus',
        default: []
    }],
    menuOrder: {
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
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    }
}, { versionKey: false });

menuSchema.index({'menuName': 'text'});

module.exports = mongoose.model('Menus', menuSchema)