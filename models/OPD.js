const mongoose = require("mongoose");
const Schema = mongoose.Schema
const opdSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    // need to change in number
    startdayofweek: {
        type: String,
        required: true,
        enum: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    },
    // need to change in nunber
    enddayofweek: {
        type: String,
        required: true,
        enum: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    },
    starttime: {
        type: String,
        required: true
    },
    endtime: {
        type: String,
        required: true
    },
    hospital: {
        type: Schema.Types.ObjectId,
        ref: 'hospital',
        required: true
    },
    doctor: {
        type: Schema.Types.ObjectId,
        ref: 'doctor',
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: false
    },
    timeslot: {
        type: Number
    },
    consultfee: {
        type: Number
    }
});

module.exports = mongoose.model("opd", opdSchema);