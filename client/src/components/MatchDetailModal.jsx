import React, { useState, useEffect, useCallback } from 'react';
import { matchService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';
import ScorecardModal from './ScorecardModal';

const MatchDetailModal = ({ isOpen, matchId, onClose }) => {
  const { user } = useAuth();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isScorecardModalOpen, setIsScorecardModalOpen] = useState(false);
  const [scorecard, setScorecard] = useState(null);
  const [joiningMatch, setJoiningMatch] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const fetchScorecard = useCallback(async () => {
    if (!matchId) return;
    try {
      const res = await matchService.getScorecard(matchId);
      setScorecard(res.data);
    } catch (err) {
      console.error('Failed to fetch scorecard', err);
    }
  }, [matchId]);

  const fetchMatchDetail = useCallback(async () => {
    if (!matchId) return;
    setLoading(true);
    try {
      const res = await matchService.getById(matchId);
      setMatch(res.data);
      if (res.data.status === 'completed') {
        fetchScorecard();
      }
      setError('');
    } catch (err) {
      console.error('Failed to fetch match details', err);
      setError('Failed to load match details.');
    } finally {
      setLoading(false);
    }
  }, [matchId, fetchScorecard]);

  useEffect(() => {
    if (isOpen && matchId) {
      fetchMatchDetail();
      setStatus({ type: '', message: '' });
      setJoiningMatch(false);
    } else {
      setMatch(null);
      setScorecard(null);
      setLoading(true);
      setError('');
      setJoiningMatch(false);
      setStatus({ type: '', message: '' });
    }
  }, [isOpen, matchId, fetchMatchDetail]);

  const handleJoinMatch = async (team) => {
    try {
      const teamName = team === 'teamA' ? match.teamA.name : match.teamB.name;
      await matchService.join(matchId, team);
      setStatus({ type: 'success', message: `Successfully joined ${teamName}!` });
      setJoiningMatch(false);
      fetchMatchDetail();
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || 'Failed to join match' });
    }
  };

  if (!isOpen) return null;

  const isCreator = user && match && (match.creator?._id === user._id || match.creator === user._id);
  const isJoined = user && match && (
    match.teamA.players.some(p => (p._id || p) === user._id) || 
    match.teamB.players.some(p => (p._id || p) === user._id)
  );
  const isFull = match && (match.teamA.players.length + match.teamB.players.length) >= (match.teamSize * 2);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      {/* Team Selection Prompt Overlay */}
      {joiningMatch && match && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-dark-light rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-dark dark:text-white">Join Team</h3>
              <button onClick={() => setJoiningMatch(false)} className="text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 gap-2">
              <button 
                onClick={() => handleJoinMatch('teamA')}
                disabled={match.teamA.players.length >= match.teamSize}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-cricket hover:bg-cricket-light/10 transition-all disabled:opacity-50"
              >
                <div className="text-left">
                  <p className="font-bold text-sm text-dark dark:text-white">{match.teamA.name}</p>
                  <p className="text-[10px] text-gray-500">{match.teamA.players.length} / {match.teamSize} Players</p>
                </div>
                <div className="text-cricket font-bold text-xs">Team A</div>
              </button>
              <button 
                onClick={() => handleJoinMatch('teamB')}
                disabled={match.teamB.players.length >= match.teamSize}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-cricket hover:bg-cricket-light/10 transition-all disabled:opacity-50"
              >
                <div className="text-left">
                  <p className="font-bold text-sm text-dark dark:text-white">{match.teamB.name}</p>
                  <p className="text-[10px] text-gray-500">{match.teamB.players.length} / {match.teamSize} Players</p>
                </div>
                <div className="text-cricket font-bold text-xs">Team B</div>
              </button>
            </div>
          </div>
        </div>
      )}

      <div 
        className="bg-white dark:bg-dark-light w-full max-w-2xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-cricket text-white">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-lg truncate">
              {loading ? 'Loading Match...' : match?.title}
            </h2>
            {match?.status === 'completed' && (
              <span className="bg-green-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Completed</span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {status.message && (
            <div className={`p-2 rounded-lg flex items-center gap-2 border text-xs ${
              status.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
            }`}>
              <span>{status.type === 'success' ? '✅' : '⚠️'}</span>
              {status.message}
            </div>
          )}
          
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader text="Getting details..." />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500 font-medium">
              {error}
            </div>
          ) : (
            <>
              {/* Result Summary if completed */}
              {match.status === 'completed' && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 p-4 rounded-xl text-center">
                  <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase mb-1">Match Result</p>
                  <p className="text-lg font-black text-green-700 dark:text-green-300 italic">{match.result}</p>
                </div>
              )}

              {/* Match Info Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-dark-dark/30 p-4 rounded-xl">
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Date</p>
                  <p className="text-sm font-bold text-dark dark:text-gray-200">
                    {new Date(match.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Time</p>
                  <p className="text-sm font-bold text-dark dark:text-gray-200">{match.time}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Format</p>
                  <p className="text-sm font-bold text-dark dark:text-gray-200">{match.teamSize}v{match.teamSize}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Creator</p>
                  <p className="text-sm font-bold text-dark dark:text-gray-200 truncate">{match.creator?.name}</p>
                </div>
              </div>

              {/* Scorecard Table if completed */}
              {match.status === 'completed' && scorecard && (
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest border-l-4 border-cricket pl-2">Quick Scorecard</h3>
                  {scorecard.innings.map((inning, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-dark-dark/10 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 flex justify-between items-center">
                        <span className="font-bold text-xs">{inning.teamName}</span>
                        <span className="font-black text-cricket">{inning.totalRuns} / {inning.totalWickets}</span>
                      </div>
                      <div className="p-3">
                        <table className="w-full text-[10px]">
                          <thead>
                            <tr className="text-gray-400 text-left border-b border-gray-200 dark:border-gray-700">
                              <th className="pb-1">Top Performers</th>
                              <th className="pb-1 text-right">Stat</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Show top 2 batsmen */}
                            {inning.batting.sort((a,b) => b.runs - a.runs).slice(0, 2).map((b, i) => (
                              <tr key={i}>
                                <td className="py-1 text-gray-600 dark:text-gray-400">{b.player?.name || b.playerName}</td>
                                <td className="py-1 text-right font-bold">{b.runs} ({b.balls})</td>
                              </tr>
                            ))}
                            <tr className="border-t border-gray-100 dark:border-gray-800 my-1"><td colSpan="2"></td></tr>
                            {/* Show top bowler */}
                            {inning.bowling.sort((a,b) => b.wickets - a.wickets).slice(0, 1).map((bw, i) => (
                              <tr key={i}>
                                <td className="py-1 text-gray-600 dark:text-gray-400">{bw.player?.name || bw.playerName}</td>
                                <td className="py-1 text-right font-bold text-cricket">{bw.wickets} / {bw.runs}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Teams Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Team A */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b-2 border-cricket pb-1">
                    <h3 className="font-bold text-dark dark:text-white">{match.teamA.name}</h3>
                    <span className="text-xs font-bold text-cricket bg-cricket-light dark:bg-cricket/10 px-2 py-0.5 rounded-full">
                      {match.teamA.players.length} / {match.teamSize}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {match.teamA.players.length === 0 ? (
                      <p className="text-xs text-gray-400 italic py-2">No players yet</p>
                    ) : (
                      match.teamA.players.map(player => (
                        <div key={player._id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-dark-dark/20 border border-gray-100 dark:border-gray-800">
                          <div className="w-8 h-8 rounded-full bg-cricket text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                            {player.profilePic ? (
                              <img src={player.profilePic} alt={player.name} className="w-full h-full object-cover" />
                            ) : (
                              player.name.charAt(0)
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-dark dark:text-gray-200 truncate">{player.name}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">{player.role} • {player.skillLevel}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Team B */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b-2 border-gray-400 pb-1">
                    <h3 className="font-bold text-dark dark:text-white">{match.teamB.name}</h3>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                      {match.teamB.players.length} / {match.teamSize}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {match.teamB.players.length === 0 ? (
                      <p className="text-xs text-gray-400 italic py-2">Waiting for challengers...</p>
                    ) : (
                      match.teamB.players.map(player => (
                        <div key={player._id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-dark-dark/20 border border-gray-100 dark:border-gray-800">
                          <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                            {player.profilePic ? (
                              <img src={player.profilePic} alt={player.name} className="w-full h-full object-cover" />
                            ) : (
                              player.name.charAt(0)
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-dark dark:text-gray-200 truncate">{player.name}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">{player.role} • {player.skillLevel}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
          
          {!isJoined && match?.status === 'scheduled' && (
            <button 
              onClick={() => setJoiningMatch(true)}
              className="btn-primary"
              disabled={isFull}
            >
              {isFull ? 'Match Full' : 'Join Match'}
            </button>
          )}
          
          {isCreator && match?.status === 'scheduled' && (
            <button 
              onClick={() => setIsScorecardModalOpen(true)}
              className="btn-primary"
            >
              Update Result / Scorecard
            </button>
          )}
        </div>
      </div>

      <ScorecardModal 
        isOpen={isScorecardModalOpen} 
        match={match} 
        onClose={() => setIsScorecardModalOpen(false)} 
        onSuccess={fetchMatchDetail}
      />
    </div>
  );
};

export default MatchDetailModal;
