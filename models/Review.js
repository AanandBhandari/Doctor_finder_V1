const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const reviewSchema = mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    doctor: {
        type: Schema.Types.ObjectId,
        ref: 'doctor'
    },
    comment: {
        type: String
    },
    star: {
        type: Number,
    }
});
module.exports = mongoose.model('reviews', reviewSchema);