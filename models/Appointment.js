const mongoose = require("mongoose");
const Schema = mongoose.Schema
const appointmentSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    preferedtime: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
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
    },
    isAvailable: {
        type: Boolean,
        required: true,
        default: false
    },
    status:{
        type: String,
        enum: ['inactive','active','canceled','complete']
    }
});

module.exports = mongoose.model("appointment", appointmentSchema);