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
    const { email, password, name, role, skillLevel, location } = req.body;
    
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
      pendingUser.skillLevel = skillLevel;
      pendingUser.location = location || { type: 'Point', coordinates: [0, 0] };
      await pendingUser.save();
    } else {
      pendingUser = new PendingUser({
        email,
        password,
        name,
        role,
        skillLevel,
        location: location || { type: 'Point', coordinates: [0, 0] },
        otp
      });
      await pendingUser.save();
    }

    // Send OTP via email
    await sendOTPEmail(email, otp);

    res.status(200).send({ message: 'OTP sent to your email. Please verify to complete signup.' });
  } catch (e) {
    console.error('Signup Initiation error:', e);
    res.status(400).send({ error: e.message || 'Error during signup initiation' });
  }
});

// Verify OTP and Create User
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const pendingUser = await PendingUser.findOne({ email, otp });
    if (!pendingUser) {
      return res.status(400).send({ error: 'Invalid or expired OTP' });
    }

    // Create the actual user
    const user = new User({
      email: pendingUser.email,
      password: pendingUser.password,
      name: pendingUser.name,
      role: pendingUser.role,
      skillLevel: pendingUser.skillLevel,
      location: pendingUser.location
    });

    await user.save();

    // Remove from pending collection
    await PendingUser.deleteOne({ _id: pendingUser._id });

    // Send welcome email
    sendWelcomeEmail(user.email, user.name); // Async but don't wait for it

    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    res.status(201).send({ user, token, message: 'Account created successfully!' });
  } catch (e) {
    console.error('OTP Verification error:', e);
    res.status(400).send({ error: e.message || 'Error during OTP verification' });
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
