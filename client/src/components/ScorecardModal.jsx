import React, { useState, useEffect } from 'react';
import { matchService } from '../services/api';
import Loader from './Loader';

const ScorecardModal = ({ isOpen, match, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State for result summary
  const [result, setResult] = useState('');
  
  // State for innings data
  const [innings, setInnings] = useState([]);
  const [activeInning, setActiveInning] = useState(0);

  useEffect(() => {
    if (isOpen && match) {
      setInnings([
        {
          teamName: match.teamA.name,
          totalRuns: 0,
          totalWickets: 0,
          totalOvers: 0,
          batting: match.teamA.players.map(p => ({ player: p._id || p, playerName: p.name || 'Player', runs: 0, balls: 0, fours: 0, sixes: 0 })),
          bowling: match.teamB.players.map(p => ({ player: p._id || p, playerName: p.name || 'Player', overs: 0, maidens: 0, runs: 0, wickets: 0 }))
        },
        {
          teamName: match.teamB.name,
          totalRuns: 0,
          totalWickets: 0,
          totalOvers: 0,
          batting: match.teamB.players.map(p => ({ player: p._id || p, playerName: p.name || 'Player', runs: 0, balls: 0, fours: 0, sixes: 0 })),
          bowling: match.teamA.players.map(p => ({ player: p._id || p, playerName: p.name || 'Player', overs: 0, maidens: 0, runs: 0, wickets: 0 }))
        }
      ]);
      setResult('');
      setActiveInning(0);
      setError('');
    }
  }, [isOpen, match]);

  if (!isOpen || !match || innings.length === 0) return null;

  const handleStatChange = (inningIdx, type, playerIdx, field, value) => {
    const newInnings = [...innings];
    newInnings[inningIdx][type][playerIdx][field] = Number(value);
    
    // Auto-calculate total runs/wickets for the inning
    if (type === 'batting' && field === 'runs') {
      newInnings[inningIdx].totalRuns = newInnings[inningIdx].batting.reduce((sum, b) => sum + b.runs, 0);
    }
    if (type === 'bowling' && field === 'wickets') {
      newInnings[inningIdx].totalWickets = newInnings[inningIdx].bowling.reduce((sum, bw) => sum + bw.wickets, 0);
    }
    
    setInnings(newInnings);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!result) {
      setError('Please enter the match result summary.');
      return;
    }
    
    setLoading(true);
    try {
      await matchService.submitScorecard(match._id, { innings, result });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to submit scorecard', err);
      setError(err.response?.data?.error || 'Failed to submit scorecard.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-white dark:bg-dark-light w-full max-w-4xl rounded-xl shadow-2xl flex flex-col my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-cricket text-white rounded-t-xl">
          <h2 className="font-bold text-lg">Update Match Scorecard</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">{error}</div>}

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Match Result Summary</label>
            <input 
              type="text" 
              placeholder="e.g. Team A won by 10 runs"
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-dark/30 focus:outline-none focus:ring-2 focus:ring-cricket"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              required
            />
          </div>

          <div className="flex border-b border-gray-100 dark:border-gray-800">
            <button 
              type="button"
              className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${activeInning === 0 ? 'border-cricket text-cricket' : 'border-transparent text-gray-400'}`}
              onClick={() => setActiveInning(0)}
            >
              1st Innings ({match.teamA.name})
            </button>
            <button 
              type="button"
              className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${activeInning === 1 ? 'border-cricket text-cricket' : 'border-transparent text-gray-400'}`}
              onClick={() => setActiveInning(1)}
            >
              2nd Innings ({match.teamB.name})
            </button>
          </div>

          <div className="space-y-8">
            {/* Batting Table */}
            <div className="space-y-3">
              <h3 className="font-bold text-dark dark:text-white flex items-center gap-2">
                <span className="w-2 h-6 bg-cricket rounded-full"></span>
                Batting: {innings[activeInning].teamName}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase font-bold">
                      <th className="py-2 pr-4">Batsman</th>
                      <th className="py-2 px-2">Runs</th>
                      <th className="py-2 px-2">Balls</th>
                      <th className="py-2 px-2">4s</th>
                      <th className="py-2 px-2">6s</th>
                    </tr>
                  </thead>
                  <tbody>
                    {innings[activeInning].batting.map((player, idx) => (
                      <tr key={idx} className="border-b border-gray-50 dark:border-gray-800/50">
                        <td className="py-3 pr-4 font-bold text-dark dark:text-gray-200">{player.playerName}</td>
                        <td className="py-2 px-2">
                          <input 
                            type="number" 
                            className="w-14 p-1 rounded border border-gray-200 dark:border-gray-700 bg-transparent"
                            value={player.runs}
                            onChange={(e) => handleStatChange(activeInning, 'batting', idx, 'runs', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input 
                            type="number" 
                            className="w-14 p-1 rounded border border-gray-200 dark:border-gray-700 bg-transparent"
                            value={player.balls}
                            onChange={(e) => handleStatChange(activeInning, 'batting', idx, 'balls', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input 
                            type="number" 
                            className="w-14 p-1 rounded border border-gray-200 dark:border-gray-700 bg-transparent"
                            value={player.fours}
                            onChange={(e) => handleStatChange(activeInning, 'batting', idx, 'fours', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input 
                            type="number" 
                            className="w-14 p-1 rounded border border-gray-200 dark:border-gray-700 bg-transparent"
                            value={player.sixes}
                            onChange={(e) => handleStatChange(activeInning, 'batting', idx, 'sixes', e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bowling Table */}
            <div className="space-y-3">
              <h3 className="font-bold text-dark dark:text-white flex items-center gap-2">
                <span className="w-2 h-6 bg-gray-400 rounded-full"></span>
                Bowling: {activeInning === 0 ? match.teamB.name : match.teamA.name}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase font-bold">
                      <th className="py-2 pr-4">Bowler</th>
                      <th className="py-2 px-2">Overs</th>
                      <th className="py-2 px-2">Maidens</th>
                      <th className="py-2 px-2">Runs</th>
                      <th className="py-2 px-2">Wickets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {innings[activeInning].bowling.map((player, idx) => (
                      <tr key={idx} className="border-b border-gray-50 dark:border-gray-800/50">
                        <td className="py-3 pr-4 font-bold text-dark dark:text-gray-200">{player.playerName}</td>
                        <td className="py-2 px-2">
                          <input 
                            type="number" step="0.1"
                            className="w-14 p-1 rounded border border-gray-200 dark:border-gray-700 bg-transparent"
                            value={player.overs}
                            onChange={(e) => handleStatChange(activeInning, 'bowling', idx, 'overs', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input 
                            type="number" 
                            className="w-14 p-1 rounded border border-gray-200 dark:border-gray-700 bg-transparent"
                            value={player.maidens}
                            onChange={(e) => handleStatChange(activeInning, 'bowling', idx, 'maidens', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input 
                            type="number" 
                            className="w-14 p-1 rounded border border-gray-200 dark:border-gray-700 bg-transparent"
                            value={player.runs}
                            onChange={(e) => handleStatChange(activeInning, 'bowling', idx, 'runs', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input 
                            type="number" 
                            className="w-14 p-1 rounded border border-gray-200 dark:border-gray-700 bg-transparent"
                            value={player.wickets}
                            onChange={(e) => handleStatChange(activeInning, 'bowling', idx, 'wickets', e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary min-w-[120px]">
              {loading ? <Loader text="" size="small" /> : 'Save Scorecard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScorecardModal;
