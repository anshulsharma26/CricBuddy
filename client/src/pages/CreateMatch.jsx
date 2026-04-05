import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { matchService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CreateMatch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    hour: '10',
    minute: '00',
    ampm: 'AM',
    teamSize: '11',
    teamA: 'Team A',
    teamB: 'Team B'
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!user.location || user.location.coordinates[0] === 0) {
      setError('You must set your location in your profile before creating a match');
      return;
    }

    setLoading(true);
    try {
      const timeStr = `${formData.hour}:${formData.minute} ${formData.ampm}`;
      const matchData = {
        title: formData.title,
        date: formData.date,
        time: timeStr,
        teamSize: parseInt(formData.teamSize),
        teamA: formData.teamA,
        teamB: formData.teamB,
        location: user.location 
      };
      
      await matchService.create(matchData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  const hasLocation = user && user.location && user.location.coordinates[0] !== 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/" className="text-sm font-semibold text-cricket hover:underline flex items-center gap-2">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="card-base animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏟️</div>
          <h2 className="text-2xl font-bold text-dark">Organize a Match</h2>
          <p className="text-gray-500 text-sm">Create teams and schedule your game</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {!hasLocation ? (
          <div className="bg-amber-50 border border-amber-100 p-6 rounded-xl text-center space-y-4">
            <p className="text-amber-800 text-sm font-medium">We need your current location to organize a match in your area.</p>
            <Link to="/profile" className="btn-primary bg-amber-600 border-none inline-block">Update Profile Now</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="label-base">Match Title</label>
                <input 
                  name="title" 
                  className="input-field"
                  placeholder="e.g., Sunday Championship"
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-base">Team A Name</label>
                  <input 
                    name="teamA" 
                    className="input-field"
                    value={formData.teamA} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div>
                  <label className="label-base">Team B Name</label>
                  <input 
                    name="teamB" 
                    className="input-field"
                    value={formData.teamB} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-base">Date</label>
                  <input 
                    type="date" 
                    name="date" 
                    className="input-field"
                    value={formData.date} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div>
                  <label className="label-base">Team Size (Per Team)</label>
                  <select 
                    name="teamSize" 
                    className="input-field"
                    value={formData.teamSize} 
                    onChange={handleChange} 
                    required
                  >
                    <option value="5">5 Players</option>
                    <option value="7">7 Players</option>
                    <option value="11">11 Players</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label-base">Start Time</label>
                <div className="grid grid-cols-3 gap-2">
                  <select name="hour" className="input-field" value={formData.hour} onChange={handleChange}>
                    {Array.from({length: 12}, (_, i) => i + 1).map(h => (
                      <option key={h} value={h < 10 ? `0${h}` : h}>{h}</option>
                    ))}
                  </select>
                  <select name="minute" className="input-field" value={formData.minute} onChange={handleChange}>
                    {['00', '15', '30', '45'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select name="ampm" className="input-field" value={formData.ampm} onChange={handleChange}>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
                 <span className="text-lg">📍</span>
                 <div className="text-xs text-gray-500">
                   <p className="font-bold text-gray-700">Location Preview</p>
                   <p>Your match will be pinned at your current coordinates.</p>
                 </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row gap-3">
              <button 
                type="submit" 
                className="btn-primary flex-1 py-3" 
                disabled={loading}
              >
                {loading ? 'Creating Match...' : 'Publish Match'}
              </button>
              <Link to="/" className="btn-secondary text-center py-3 md:px-8">
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateMatch;
