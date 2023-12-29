require('../database');
const mongoose = require('mongoose');
const { Schema } = mongoose;

let bannerSchema = new Schema({
    count: {
        type: Number,
        default: 0
    },
},{timestamps:true});

module.exports = mongoose.model('Counts', bannerSchema)