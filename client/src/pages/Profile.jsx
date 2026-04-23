import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/api';
import Loader from '../components/Loader';
import ImageModal from '../components/ImageModal';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    skillLevel: '',
    location: { type: 'Point', coordinates: [0, 0] },
    profilePic: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');

  const openImageModal = (imageSrc) => {
    setModalImage(imageSrc);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        role: user.role || 'all-rounder',
        skillLevel: user.skillLevel || 'beginner',
        location: user.location || { type: 'Point', coordinates: [0, 0] },
        profilePic: user.profilePic || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setStatus({ type: 'error', message: 'File size must be less than 2MB' });
        return;
      }
      if (!file.type.startsWith('image/')) {
        setStatus({ type: 'error', message: 'Please select an image file' });
        return;
      }
      setPreviewUrl(URL.createObjectURL(file));
      setStatus({ type: '', message: '' });
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current.files[0];
    if (!file) return;

    setUploading(true);
    setStatus({ type: '', message: '' });

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await profileService.uploadProfilePic(formData);
      const newPicUrl = res.data.secure_url;
      
      // Update local state and preview
      setFormData(prev => ({ ...prev, profilePic: newPicUrl }));
      setPreviewUrl(null);
      
      // Update the whole user object in context
      await updateProfile({ profilePic: newPicUrl });
      
      setStatus({ type: 'success', message: 'Profile picture updated!' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateLocation = () => {
    debugger;
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
      (error) => {
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
    } catch {
      setStatus({ type: 'error', message: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Loader text="Setting the pitch..." />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <div className="card-base animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 pb-4 border-b border-gray-100">
          <div className="relative group">
            <div className="w-16 h-16 rounded-full bg-cricket text-white flex items-center justify-center text-xl font-bold shadow-md shadow-cricket/10 overflow-hidden border-2 border-white cursor-pointer" onClick={() => openImageModal(previewUrl || formData.profilePic)}>
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : formData.profilePic ? (
                <img src={formData.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                formData.name.charAt(0).toUpperCase()
              )}
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-lg font-bold text-dark leading-tight">{formData.name}</h1>
            <p className="text-xs text-gray-500 font-medium capitalize">{formData.role} • {formData.skillLevel}</p>
            
            <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current.click()}
                className="text-[10px] font-bold text-cricket hover:underline"
              >
                {previewUrl ? 'Change Selection' : 'Change Picture'}
              </button>
              {previewUrl && !uploading && (
                <button 
                  type="button" 
                  onClick={handleUpload}
                  className="bg-cricket text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm hover:bg-cricket-dark transition-colors"
                >
                  Confirm Upload
                </button>
              )}
            </div>
          </div>

          <div className="mt-1 inline-flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500">
            <span>📍</span> 
            {formData.location.coordinates[0] !== 0 
              ? `${formData.location.coordinates[0].toFixed(2)}, ${formData.location.coordinates[1].toFixed(2)}`
              : 'No location set'}
          </div>
        </div>

        {/* Career Stats Dashboard */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          <div className="bg-cricket/5 border border-cricket/10 rounded-xl p-3 text-center">
            <p className="text-[10px] text-cricket/60 font-black uppercase tracking-widest mb-1">Matches</p>
            <p className="text-xl font-black text-cricket">{user.careerStats?.matchesPlayed || 0}</p>
          </div>
          <div className="bg-cricket/5 border border-cricket/10 rounded-xl p-3 text-center">
            <p className="text-[10px] text-cricket/60 font-black uppercase tracking-widest mb-1">Runs</p>
            <p className="text-xl font-black text-cricket">{user.careerStats?.totalRuns || 0}</p>
          </div>
          <div className="bg-cricket/5 border border-cricket/10 rounded-xl p-3 text-center">
            <p className="text-[10px] text-cricket/60 font-black uppercase tracking-widest mb-1">Wickets</p>
            <p className="text-xl font-black text-cricket">{user.careerStats?.totalWickets || 0}</p>
          </div>
        </div>

        {status.message && (
          <div className={`p-2 rounded flex items-center gap-2 border shadow-sm mb-4 text-xs animate-in zoom-in-95 duration-200 ${
            status.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
          }`}>
            <span>{status.type === 'success' ? '✅' : '⚠️'}</span>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              <label className="label-base">Location</label>
              <button 
                type="button" 
                className="btn-secondary w-full flex items-center justify-center gap-2" 
                onClick={handleUpdateLocation}
              >
                <span>🎯</span> Get Current Location
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <ImageModal 
        isOpen={isModalOpen} 
        imageSrc={modalImage} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Profile;
