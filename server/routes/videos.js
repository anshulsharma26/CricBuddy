const express = require('express');
const Video = require('../models/Video');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all videos
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category && category !== 'All') {
      query.category = category;
    }

    // Sort by most recent (descending)
    const videos = await Video.find(query).sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Add a new video (coaches only)
router.post('/', auth, async (req, res) => {
  try {
    const { title, expert, category, videoId } = req.body;

    // Verify user is a coach
    if (req.user.userType !== 'coach') {
      return res.status(403).json({ error: 'Only coaches can add videos' });
    }

    if (!title || !expert || !category || !videoId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const video = new Video({
      title,
      expert,
      category,
      videoId,
      uploadedBy: req.user._id
    });

    await video.save();
    res.status(201).json(video);
  } catch (error) {
    console.error('Error saving video:', error);
    res.status(500).json({ error: 'Failed to save video' });
  }
});

module.exports = router;
