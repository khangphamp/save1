require('../database');
const mongoose = require('mongoose');
const { Schema } = mongoose;

let leagueSchema = new Schema({
    name:{
        type: String,
        required: true,
    },
    slug: {
        type: String,
    },
    thumb:{
        type: String
    },
    contentOdd: {
        type: String,
    },
    contentSchedule: {
        type: String,
    },
    contentRank: {
        type: String,
    },
    contentResult: {
        type: String,
    },
    refId:{
        type: String,
        required: true,
        unique: true
    },
    refName: {
        type: String,
    },
    order: {
      type: Number,
      default: 0
    },
    createdTime: {
        type: Date,
        default: Date.now()
    },
    updatedTime: {
        type: Date
    },
    isShow: {
        type: Boolean,
        default: true
    },
}, { versionKey: false });


module.exports = mongoose.model('Leagues', leagueSchema)