const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['batsman', 'bowler', 'all-rounder'],
    default: 'all-rounder'
  },
  skillLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      default: [0, 0] // [longitude, latitude]
    }
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Automatically delete document after 10 minutes
  }
});

module.exports = mongoose.model('PendingUser', pendingUserSchema);
