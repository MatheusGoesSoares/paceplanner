const mongoose = require('mongoose');

const runSessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    distance: { type: Number, required: true },
    duration: { type: Number, required: true },
    pace: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    notes: { type: String, trim: true },
    location: { type: String, trim: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('RunSession', runSessionSchema);