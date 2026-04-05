import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  // ... rest of state
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    skillLevel: '',
    location: { type: 'Point', coordinates: [0, 0] }
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        role: user.role || 'all-rounder',
        skillLevel: user.skillLevel || 'beginner',
        location: user.location || { type: 'Point', coordinates: [0, 0] }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
      setStatus({ type: 'error', message: 'Geolocation is not supported by your browser' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          location: {
            type: 'Point',
            coordinates: [position.coords.longitude, position.coords.latitude]
          }
        });
        setStatus({ type: 'success', message: 'Location detected! Click "Save Changes" to update.' });
      },
      () => {
        setStatus({ type: 'error', message: 'Unable to retrieve your location' });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      await updateProfile(formData);
      setStatus({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Loader text="Setting the pitch..." />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="card-base animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-gray-100">
          <div className="w-24 h-24 rounded-full bg-cricket text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-cricket/20">
            {formData.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-dark">{formData.name}</h1>
            <p className="text-gray-500 font-medium capitalize">{formData.role} • {formData.skillLevel} Level</p>
            <div className="mt-2 inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold text-gray-600">
              <span>📍</span> 
              {formData.location.coordinates[0] !== 0 
                ? `${formData.location.coordinates[0].toFixed(2)}, ${formData.location.coordinates[1].toFixed(2)}`
                : 'No location set'}
            </div>
          </div>
        </div>

        {status.message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm mb-6 animate-in zoom-in-95 duration-200 ${
            status.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
          }`}>
            <span>{status.type === 'success' ? '✅' : '⚠️'}</span>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label-base">Display Name</label>
              <input 
                name="name" 
                className="input-field"
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div>
              <label className="label-base">Primary Role</label>
              <select 
                name="role" 
                className="input-field"
                value={formData.role} 
                onChange={handleChange}
              >
                <option value="batsman">Batsman</option>
                <option value="bowler">Bowler</option>
                <option value="all-rounder">All-rounder</option>
              </select>
            </div>
            <div>
              <label className="label-base">Skill Level</label>
              <select 
                name="skillLevel" 
                className="input-field"
                value={formData.skillLevel} 
                onChange={handleChange}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="label-base">Location Settings</label>
              <button 
                type="button" 
                className="btn-secondary w-full flex items-center justify-center gap-2 py-2.5" 
                onClick={handleUpdateLocation}
              >
                <span>🎯</span> Get Current Location
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <button 
              type="submit" 
              className="btn-primary w-full md:w-auto md:px-12" 
              disabled={loading}
            >
              {loading ? 'Saving changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
