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
  date: {
    type: Date,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  hospital: {
    type: Schema.Types.ObjectId,
    ref: "hospital",
    required: true
  },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: "doctor",
    required: true
  },
  opd: {
    type: Schema.Types.ObjectId,
    ref: "opd",
    required: true
  },
  status: {
    type: String,
    enum: ["inactive", "active", "complete", "expire"]
  }
});

module.exports = mongoose.model("appointment", appointmentSchema);