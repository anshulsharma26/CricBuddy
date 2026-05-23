const express = require('express');
const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');
const router = express.Router();

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Signup - Initiation (Send OTP)
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, role, skillLevel, location, locationName, userType } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).send({ error: 'Email, password, and name are required' });
    }

    if (password.length < 6) {
      return res.status(400).send({ error: 'Password must be at least 6 characters' });
    }
    
    // Check if user already exists in permanent collection
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ error: 'Email already in use' });
    }

    const otp = generateOTP();

    // Check if there's already a pending signup for this email
    let pendingUser = await PendingUser.findOne({ email });
    if (pendingUser) {
      pendingUser.otp = otp;
      pendingUser.password = password; // Update if password changed
      pendingUser.name = name;
      pendingUser.role = role;
      pendingUser.userType = userType || 'student';
      pendingUser.skillLevel = skillLevel;
      pendingUser.location = location || { type: 'Point', coordinates: [0, 0] };
      pendingUser.locationName = locationName || '';
      await pendingUser.save();
    } else {
      pendingUser = new PendingUser({
        email,
        password,
        name,
        role,
        userType: userType || 'student',
        skillLevel,
        location: location || { type: 'Point', coordinates: [0, 0] },
        locationName: locationName || '',
        otp
      });
      await pendingUser.save();
    }

    // Send OTP via email
    await sendOTPEmail(email, otp);

    res.status(200).send({ message: 'OTP sent to your email. Please verify to complete signup.' });
  } catch (e) {
    console.error('Signup Initiation error:', e.message, e.stack);
    
    if (e.message === 'Failed to send OTP email') {
      return res.status(503).send({ error: 'Failed to send OTP email. Please try again later.' });
    }
    if (e.name === 'ValidationError') {
      return res.status(422).send({ error: e.message });
    }
    res.status(500).send({ error: e.message || 'Error during signup initiation' });
  }
});

// Verify OTP and Create User
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).send({ error: 'Email and OTP are required' });
    }

    console.log('Verify OTP attempt for:', email);
    
    const pendingUser = await PendingUser.findOne({ email: email.toLowerCase().trim(), otp: otp.trim() });
    if (!pendingUser) {
      // Check if there's a pending user at all (OTP might be wrong vs expired)
      const pendingExists = await PendingUser.findOne({ email: email.toLowerCase().trim() });
      if (pendingExists) {
        return res.status(400).send({ error: 'Invalid OTP. Please check and try again.' });
      }
      return res.status(400).send({ error: 'OTP has expired. Please request a new one.' });
    }

    // Check if user already exists (might have been created in a parallel request)
    const existingUser = await User.findOne({ email: pendingUser.email });
    if (existingUser) {
      await PendingUser.deleteOne({ _id: pendingUser._id });
      const token = jwt.sign({ _id: existingUser._id.toString() }, process.env.JWT_SECRET);
      return res.status(200).send({ user: existingUser, token, message: 'Account already exists. Logged in!' });
    }

    // Create the actual user
    const user = new User({
      email: pendingUser.email,
      password: pendingUser.password,
      name: pendingUser.name,
      role: pendingUser.role,
      userType: pendingUser.userType || 'student',
      skillLevel: pendingUser.skillLevel,
      location: pendingUser.location,
      locationName: pendingUser.locationName || ''
    });

    await user.save();
    console.log('User created successfully:', user.email);

    // Remove from pending collection
    await PendingUser.deleteOne({ _id: pendingUser._id });

    // Send welcome email (fire and forget)
    sendWelcomeEmail(user.email, user.name).catch(err => 
      console.error('Welcome email failed (non-blocking):', err.message)
    );

    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    res.status(201).send({ user, token, message: 'Account created successfully!' });
  } catch (e) {
    console.error('OTP Verification error:', e.message, e.stack);
    
    // Duplicate key error (email already exists)
    if (e.code === 11000) {
      return res.status(409).send({ error: 'An account with this email already exists.' });
    }
    // Mongoose validation error
    if (e.name === 'ValidationError') {
      return res.status(422).send({ error: e.message });
    }
    // JWT signing error (likely missing JWT_SECRET env var)
    if (e.message && e.message.includes('secretOrPrivateKey')) {
      console.error('JWT_SECRET is not configured!');
      return res.status(500).send({ error: 'Server configuration error. Please contact support.' });
    }
    res.status(500).send({ error: e.message || 'Error during OTP verification' });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const pendingUser = await PendingUser.findOne({ email });
    
    if (!pendingUser) {
      return res.status(404).send({ error: 'No pending signup found for this email' });
    }

    const otp = generateOTP();
    pendingUser.otp = otp;
    await pendingUser.save();

    await sendOTPEmail(email, otp);
    res.status(200).send({ message: 'A new OTP has been sent to your email.' });
  } catch (e) {
    console.error('Resend OTP error:', e);
    res.status(400).send({ error: e.message || 'Error resending OTP' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send({ error: 'Invalid login credentials' });
    }

    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    res.send({ user, token });
  } catch (e) {
    console.error('Auth error:', e);
    let errorMessage = 'Error occurred during authentication';
    
    if (e.code === 11000) {
      const field = Object.keys(e.keyPattern)[0];
      errorMessage = `The ${field} already exists. Please use another one.`;
      if (field === 'email') errorMessage = 'Email already in use';
    } else if (e.message) {
      errorMessage = e.message;
    }
    
    res.status(400).send({ error: errorMessage });
  }
});

module.exports = router;
