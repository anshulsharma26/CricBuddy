const mongoose = require('mongoose');

const scorecardSchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  innings: [
    {
      teamName: String,
      totalRuns: { type: Number, default: 0 },
      totalWickets: { type: Number, default: 0 },
      totalOvers: { type: Number, default: 0 },
      batting: [
        {
          player: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          playerName: String,
          runs: { type: Number, default: 0 },
          balls: { type: Number, default: 0 },
          fours: { type: Number, default: 0 },
          sixes: { type: Number, default: 0 }
        }
      ],
      bowling: [
        {
          player: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          playerName: String,
          overs: { type: Number, default: 0 },
          maidens: { type: Number, default: 0 },
          runs: { type: Number, default: 0 },
          wickets: { type: Number, default: 0 }
        }
      ]
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Scorecard', scorecardSchema);
