const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String, // 12-hour format string, e.g., "10:30 AM"
    required: true
  },
  teamSize: {
    type: Number,
    required: true,
    enum: [5, 7, 11],
    default: 11
  },
  teamA: {
    name: { type: String, required: true },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  teamB: {
    name: { type: String, required: true },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  playersJoined: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['scheduled', 'completed'],
    default: 'scheduled'
  },
  result: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

matchSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Match', matchSchema);
