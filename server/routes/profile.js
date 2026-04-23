const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer Storage (Memory)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  res.send(req.user);
});

// Update profile
router.put('/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'role', 'skillLevel', 'location', 'profilePic'];
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

// Upload profile picture
router.post('/upload-profile-pic', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ error: 'Please upload an image' });
    }

    // Convert buffer to base64 for Cloudinary
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: 'cricbuddy_profiles',
      width: 500,
      height: 500,
      crop: 'fill',
      gravity: 'face'
    });

    req.user.profilePic = result.secure_url;
    await req.user.save();

    res.send({ secure_url: result.secure_url });
  } catch (e) {
    console.error('Upload Error:', e);
    res.status(500).send({ error: 'Failed to upload image' });
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
