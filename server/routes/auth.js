const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, role, skillLevel, location } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ error: 'Email already in use' });
    }

    const user = new User({
      email,
      password,
      name,
      role,
      skillLevel,
      location: location || { type: 'Point', coordinates: [0, 0] }
    });

    await user.save();
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    res.status(201).send({ user, token });
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
