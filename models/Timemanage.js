const mongoose = require("mongoose");
const Schema = mongoose.Schema
const timemanageSchema = new mongoose.Schema({
    opd: {
        type: Schema.Types.ObjectId,
        ref: 'opd',
        unique: true
    },
    // need to change bookedtime according no of days available
    bookedTime: [{
        date : {
            type: Date,
            required: true
        },
        availabletimeslot: [Number]
    }]
});

module.exports = mongoose.model("timemanage", timemanageSchema);