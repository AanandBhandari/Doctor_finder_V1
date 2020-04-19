const mongoose = require("mongoose");
const Schema = mongoose.Schema
const opdSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    startdate: {
        type: Date,
        required: true,
    },
    enddate: {
        type: Date,
        required: true,
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