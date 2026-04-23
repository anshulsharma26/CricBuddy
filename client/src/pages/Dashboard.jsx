import React, { useState, useEffect } from 'react';
import { profileService, matchService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import ImageModal from '../components/ImageModal';

const Dashboard = () => {
  const { user } = useAuth();
  const [nearbyPlayers, setNearbyPlayers] = useState([]);
  const [nearbyMatches, setNearbyMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');

  const openImageModal = (imageSrc) => {
    setModalImage(imageSrc);
    setIsModalOpen(true);
  };

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
    <div className="max-w-6xl mx-auto px-4 space-y-6 pb-8 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-xl font-bold text-dark dark:text-white tracking-tight">Welcome, {user.name}!</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Ready for a game today?</p>
        </div>
        <div className="flex items-center gap-2">
           <Link to="/create-match" className="btn-primary">Organize Match</Link>
           <Link to="/profile" className="btn-secondary">Update Location</Link>
        </div>
      </div>

      {status.message && (
        <div className={`p-2 rounded-lg flex items-center gap-2 border shadow-sm text-sm animate-in fade-in slide-in-from-top-1 duration-300 ${
          status.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/20' 
            : 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/20'
        }`}>
          <span>{status.type === 'success' ? '✅' : '⚠️'}</span>
          {status.message}
        </div>
      )}
      
      {!hasLocation && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-4 rounded-lg flex items-center gap-4 animate-pulse">
          <div className="text-2xl">📍</div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-400">Location Access Required</h3>
            <p className="text-amber-700 dark:text-amber-500 text-xs">Set location in profile to discover matches.</p>
          </div>
          <Link to="/profile" className="btn-primary bg-amber-600 hover:bg-amber-700 border-none text-xs">
            Set Location
          </Link>
        </div>
      )}

      {hasLocation && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <span role="img" aria-label="match">🏟️</span> Nearby Matches
              </h2>
            </div>

            {nearbyMatches.length === 0 ? (
              <div className="card-base text-center py-8 bg-gray-50 dark:bg-dark-light/50 border-dashed border-2 border-gray-200 dark:border-gray-700">
                <div className="text-2xl mb-2">🏏</div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">No matches found</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Be the first to organize a match!</p>
                <Link to="/create-match" className="btn-primary">Start a Match</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {nearbyMatches.map(match => (
                  <div key={match._id} className="card-base group flex flex-col justify-between border-l-4 border-l-cricket">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight">
                          {new Date(match.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {match.time}
                        </div>
                        <div className="text-[10px] font-bold text-cricket bg-cricket-light dark:bg-cricket/10 px-1.5 py-0.5 rounded">
                           {match.teamSize}v{match.teamSize}
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-dark dark:text-white mb-3 truncate">{match.title}</h3>
                      
                      <div className="flex items-center justify-between bg-gray-50 dark:bg-dark-dark/30 rounded-md p-2 gap-2">
                        <div className="flex-1 text-center">
                           <p className="text-xs font-bold text-dark dark:text-gray-200 truncate">{match.teamA.name}</p>
                           <p className="text-[10px] text-gray-500 dark:text-gray-400">{match.teamA.players.length} joined</p>
                        </div>
                        <div className="text-[10px] font-black text-gray-300 dark:text-gray-600 italic">VS</div>
                        <div className="flex-1 text-center">
                           <p className="text-xs font-bold text-dark dark:text-gray-200 truncate">{match.teamB.name}</p>
                           <p className="text-[10px] text-gray-500 dark:text-gray-400">{match.teamB.players.length} joined</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                       <div className="text-[10px] text-gray-400 dark:text-gray-500">
                         By <span className="font-semibold text-gray-600 dark:text-gray-300">{match.creator?.name}</span>
                       </div>
                       
                       {!(match.teamA.players.includes(user._id) || match.teamB.players.includes(user._id)) ? (
                        <button 
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                            (match.teamA.players.length + match.teamB.players.length) >= (match.teamSize * 2)
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                              : 'bg-cricket text-white hover:bg-cricket-dark'
                          }`}
                          onClick={() => handleJoinMatch(match._id)}
                          disabled={(match.teamA.players.length + match.teamB.players.length) >= (match.teamSize * 2)}
                        >
                          {(match.teamA.players.length + match.teamB.players.length) >= (match.teamSize * 2) ? 'Full' : 'Join'}
                        </button>
                      ) : (
                        <div className="text-[10px] font-bold text-green-600 dark:text-green-500 flex items-center gap-1">
                           <span>✓</span> Joined
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <span role="img" aria-label="players">👟</span> Nearby Players
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {nearbyPlayers.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-xs">No players nearby.</p>
              ) : (
                nearbyPlayers.map(player => (
                  <div key={player._id} className="card-base p-2 flex items-center gap-3">
                    <div 
                      className={`w-8 h-8 rounded-full bg-cricket-light dark:bg-cricket/10 text-cricket flex items-center justify-center text-xs font-bold uppercase shrink-0 overflow-hidden ${player.profilePic ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                      onClick={() => player.profilePic && openImageModal(player.profilePic)}
                    >
                      {player.profilePic ? (
                        <img src={player.profilePic} alt={player.name} className="w-full h-full object-cover" />
                      ) : (
                        player.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-dark dark:text-gray-200 text-xs truncate">{player.name}</h4>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{player.role} • {player.skillLevel}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <ImageModal 
        isOpen={isModalOpen} 
        imageSrc={modalImage} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
