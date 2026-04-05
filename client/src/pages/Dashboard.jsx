import React, { useState, useEffect } from 'react';
import { profileService, matchService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';

const Dashboard = () => {
  const { user } = useAuth();
  const [nearbyPlayers, setNearbyPlayers] = useState([]);
  const [nearbyMatches, setNearbyMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchData = async () => {
      if (user && user.location && user.location.coordinates[0] !== 0) {
        try {
          const [lon, lat] = user.location.coordinates;
          const playersRes = await profileService.getNearby({ longitude: lon, latitude: lat, radius: 50 });
          const matchesRes = await matchService.getNearby({ longitude: lon, latitude: lat, radius: 50 });
          setNearbyPlayers(playersRes.data);
          setNearbyMatches(matchesRes.data);
        } catch (err) {
          console.error('Failed to fetch nearby data', err);
          setStatus({ type: 'error', message: 'Failed to load nearby matches/players. Please check your connection.' });
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleJoinMatch = async (matchId) => {
    try {
      await matchService.join(matchId);
      setStatus({ type: 'success', message: 'Successfully joined the match!' });
      const [lon, lat] = user.location.coordinates;
      const matchesRes = await matchService.getNearby({ longitude: lon, latitude: lat });
      setNearbyMatches(matchesRes.data);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || 'Failed to join match' });
    }
  };

  if (loading) return <Loader text="Setting the pitch..." />;

  const hasLocation = user && user.location && user.location.coordinates[0] !== 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-dark">Welcome back, {user.name}!</h1>
          <p className="text-gray-500 mt-1">Ready for a game today?</p>
        </div>
        <div className="flex items-center gap-3">
           <Link to="/create-match" className="btn-primary text-sm">Organize Match</Link>
           <Link to="/profile" className="btn-secondary text-sm">Update Location</Link>
        </div>
      </div>

      {status.message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 ${
          status.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
        }`}>
          <span>{status.type === 'success' ? '✅' : '⚠️'}</span>
          {status.message}
        </div>
      )}
      
      {!hasLocation && (
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-4 text-center md:text-left animate-pulse">
          <div className="text-4xl">📍</div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-900">Location Access Required</h3>
            <p className="text-amber-700 text-sm">Please set your location in your profile to discover matches near you.</p>
          </div>
          <Link to="/profile" className="btn-primary bg-amber-600 hover:bg-amber-700 border-none whitespace-nowrap">
            Set Location Now
          </Link>
        </div>
      )}

      {hasLocation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span role="img" aria-label="match">🏟️</span> Nearby Matches
              </h2>
            </div>

            {nearbyMatches.length === 0 ? (
              <div className="card-base text-center py-12 bg-gray-50 border-dashed border-2 border-gray-200">
                <div className="text-4xl mb-3">🏏</div>
                <h3 className="font-bold text-gray-700">No matches found</h3>
                <p className="text-gray-500 text-sm mb-4">Be the first to organize a match in your area!</p>
                <Link to="/create-match" className="btn-primary text-sm">Start a Match</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nearbyMatches.map(match => (
                  <div key={match._id} className="card-base group overflow-hidden border-t-4 border-t-cricket">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                        {new Date(match.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-xs font-bold text-cricket bg-cricket-light px-2 py-1 rounded italic">
                         {match.time}
                      </div>
                    </div>

                    <div className="text-center mb-6">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">{match.title}</h3>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                           <p className="text-lg font-black text-dark leading-tight">{match.teamA.name}</p>
                           <p className="text-xs text-gray-500 font-bold">{match.teamA.players.length} / {match.teamSize}</p>
                        </div>
                        <div className="text-xl font-black text-gray-300 italic">VS</div>
                        <div className="flex-1">
                           <p className="text-lg font-black text-dark leading-tight">{match.teamB.name}</p>
                           <p className="text-xs text-gray-500 font-bold">{match.teamB.players.length} / {match.teamSize}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                       <div className="text-xs text-gray-400">
                         By <span className="font-bold text-gray-600">{match.creator?.name}</span>
                       </div>
                       <div className="text-xs font-bold text-gray-500">
                         {match.teamSize * 2} Players Total
                       </div>
                    </div>

                    <div className="mt-6">
                      {!(match.teamA.players.includes(user._id) || match.teamB.players.includes(user._id)) ? (
                        <button 
                          className={`w-full py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                            (match.teamA.players.length + match.teamB.players.length) >= (match.teamSize * 2)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-cricket text-white hover:bg-cricket-dark hover:-translate-y-0.5'
                          }`}
                          onClick={() => handleJoinMatch(match._id)}
                          disabled={(match.teamA.players.length + match.teamB.players.length) >= (match.teamSize * 2)}
                        >
                          {(match.teamA.players.length + match.teamB.players.length) >= (match.teamSize * 2) ? 'Match Full' : 'Join Game'}
                        </button>
                      ) : (
                        <div className="w-full py-2.5 bg-green-50 text-green-700 font-bold text-center rounded-xl flex items-center justify-center gap-2 border border-green-100">
                           <span>🏏</span> You're in!
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span role="img" aria-label="players">👟</span> Nearby Players
            </h2>
            <div className="space-y-4">
              {nearbyPlayers.length === 0 ? (
                <p className="text-gray-500 text-sm">No other players nearby.</p>
              ) : (
                nearbyPlayers.map(player => (
                  <div key={player._id} className="card-base p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-cricket-light text-cricket flex items-center justify-center text-sm font-bold uppercase">
                      {player.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-dark text-sm">{player.name}</h4>
                      <p className="text-xs text-gray-400 font-medium">{player.role} • {player.skillLevel}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
