const mongoose = require("mongoose");
const Schema = mongoose.Schema
const timemanageSchema = new mongoose.Schema({
    opd: {
        type: Schema.Types.ObjectId,
        ref: 'opd',
        unique: true
    },
    bookedTime: [Number]
});

module.exports = mongoose.model("timemanage", timemanageSchema);