const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Get current user profile
router.get('/me', auth, async (req, res) => {
  res.send(req.user);
});

// Update profile
router.put('/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'role', 'skillLevel', 'location'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Get nearby players
router.get('/nearby', auth, async (req, res) => {
  try {
    const { longitude, latitude, radius = 5 } = req.query; // radius in km

    if (!longitude || !latitude) {
      return res.status(400).send({ error: 'Longitude and Latitude are required' });
    }

    const nearbyPlayers = await User.find({
      _id: { $ne: req.user._id }, // Exclude current user
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    });

    res.send(nearbyPlayers);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
