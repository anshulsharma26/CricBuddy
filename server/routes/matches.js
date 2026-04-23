const express = require('express');
const auth = require('../middleware/auth');
const Match = require('../models/Match');
const User = require('../models/User');
const Scorecard = require('../models/Scorecard');
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
    console.error('Nearby matches error:', e);
    res.status(500).send(e);
  }
});

// Get single match detail
router.get('/:id', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('creator', 'name')
      .populate('teamA.players', 'name role profilePic skillLevel')
      .populate('teamB.players', 'name role profilePic skillLevel');
    
    if (!match) {
      return res.status(404).send({ error: 'Match not found' });
    }
    res.send(match);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Join a match
router.post('/:id/join', auth, async (req, res) => {
  try {
    const { team } = req.body;
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).send({ error: 'Match not found' });
    }

    if (!['teamA', 'teamB'].includes(team)) {
      return res.status(400).send({ error: 'Invalid team selection' });
    }

    // Check if user is already in any team
    const isAlreadyJoined = match.teamA.players.includes(req.user._id) || 
                            match.teamB.players.includes(req.user._id);
    
    if (isAlreadyJoined) {
      return res.status(400).send({ error: 'Already joined this match' });
    }

    // Assign to the selected team if not full
    if (match[team].players.length < match.teamSize) {
      match[team].players.push(req.user._id);
    } else {
      return res.status(400).send({ error: `${match[team].name} is already full` });
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

// Submit a scorecard
router.post('/:id/scorecard', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).send({ error: 'Match not found' });
    }

    // Only creator can submit scorecard
    if (match.creator.toString() !== req.user._id.toString()) {
      return res.status(403).send({ error: 'Only the match creator can submit a scorecard' });
    }

    if (match.status === 'completed') {
      return res.status(400).send({ error: 'Scorecard already submitted for this match' });
    }

    const { innings, result } = req.body;

    const scorecard = new Scorecard({
      match: match._id,
      innings
    });

    await scorecard.save();

    // Update match status and result
    match.status = 'completed';
    match.result = result;
    await match.save();

    // Robust Career Stats Update
    const allPlayersInScorecard = new Set();
    innings.forEach(inn => {
      inn.batting.forEach(b => { if(b.player) allPlayersInScorecard.add(b.player.toString()) });
      inn.bowling.forEach(bw => { if(bw.player) allPlayersInScorecard.add(bw.player.toString()) });
    });

    for (const playerId of allPlayersInScorecard) {
      let playerRuns = 0;
      let playerWickets = 0;

      innings.forEach(inn => {
        const b = inn.batting.find(x => x.player && x.player.toString() === playerId);
        if (b) playerRuns += b.runs;
        const bw = inn.bowling.find(x => x.player && x.player.toString() === playerId);
        if (bw) playerWickets += bw.wickets;
      });

      await User.findByIdAndUpdate(playerId, {
        $inc: {
          'careerStats.matchesPlayed': 1,
          'careerStats.totalRuns': playerRuns,
          'careerStats.totalWickets': playerWickets
        }
      });
    }

    res.status(201).send(scorecard);
  } catch (e) {
    console.error('Scorecard submission error:', e);
    res.status(400).send({ error: e.message });
  }
});

// Get scorecard for a match
router.get('/:id/scorecard', auth, async (req, res) => {
  try {
    const scorecard = await Scorecard.findOne({ match: req.params.id })
      .populate('innings.batting.player', 'name')
      .populate('innings.bowling.player', 'name');
    
    if (!scorecard) {
      return res.status(404).send({ error: 'Scorecard not found' });
    }
    res.send(scorecard);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
