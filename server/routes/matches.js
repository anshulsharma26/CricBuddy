const express = require('express');
const auth = require('../middleware/auth');
const Match = require('../models/Match');
const User = require('../models/User');
const router = express.Router();

// Create a match
router.post('/', auth, async (req, res) => {
  try {
    const { title, date, time, teamSize, teamA, teamB, location } = req.body;
    
    const match = new Match({
      title,
      date,
      time,
      teamSize,
      teamA: {
        name: teamA,
        players: [req.user._id] // Creator joins Team A by default
      },
      teamB: {
        name: teamB,
        players: []
      },
      location,
      creator: req.user._id,
      playersJoined: [req.user._id]
    });
    
    await match.save();
    res.status(201).send(match);
  } catch (e) {
    console.error('Create match error:', e);
    res.status(400).send({ error: e.message });
  }
});

// Get all matches
router.get('/', auth, async (req, res) => {
  try {
    const matches = await Match.find({}).populate('creator', 'name').sort({ date: 1 });
    res.send(matches);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Get nearby matches
router.get('/nearby', auth, async (req, res) => {
  try {
    const { longitude, latitude, radius = 50 } = req.query; // Default to 50km

    if (!longitude || !latitude) {
      return res.status(400).send({ error: 'Longitude and Latitude are required' });
    }

    const matches = await Match.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radius * 1000
        }
      }
    }).populate('creator', 'name');

    res.send(matches);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Join a match
router.post('/:id/join', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).send({ error: 'Match not found' });
    }

    // Check if user is already in any team
    const isAlreadyJoined = match.teamA.players.includes(req.user._id) || 
                            match.teamB.players.includes(req.user._id);
    
    if (isAlreadyJoined) {
      return res.status(400).send({ error: 'Already joined this match' });
    }

    // Assign to Team A if not full, otherwise Team B
    if (match.teamA.players.length < match.teamSize) {
      match.teamA.players.push(req.user._id);
    } else if (match.teamB.players.length < match.teamSize) {
      match.teamB.players.push(req.user._id);
    } else {
      return res.status(400).send({ error: 'Match is already full' });
    }

    // Update helper array for easier flat checks if needed
    match.playersJoined.push(req.user._id);
    await match.save();

    // Update user's matchesJoined
    req.user.matchesJoined.push(match._id);
    await req.user.save();

    res.send(match);
  } catch (e) {
    console.error('Join match error:', e);
    res.status(400).send({ error: e.message });
  }
});

module.exports = router;
