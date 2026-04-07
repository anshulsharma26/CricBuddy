import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'all-rounder',
    skillLevel: 'beginner'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(formData);
      navigate('/profile'); 
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-100px)] px-4 py-4">
      <div className="card-base max-w-sm w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="text-center mb-6">
          <div className="text-2xl mb-1">🤝</div>
          <h2 className="text-lg font-bold text-dark">Join the Squad</h2>
          <p className="text-gray-500 text-xs">Create your player profile</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded text-xs mb-4 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label-base">Full Name</label>
            <input 
              type="text" 
              name="name" 
              className="input-field"
              placeholder="Virat Kohli"
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div>
            <label className="label-base">Email</label>
            <input 
              type="email" 
              name="email" 
              className="input-field"
              placeholder="virat@example.com"
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div>
            <label className="label-base">Password</label>
            <input 
              type="password" 
              name="password" 
              className="input-field"
              placeholder="Min 6 characters"
              value={formData.password} 
              onChange={handleChange} 
              required 
              minLength="6"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-base">Role</label>
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
              <label className="label-base">Skill</label>
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
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full mt-2" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Creating...
              </span>
            ) : 'Sign Up Now'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-xs">
            Already have an account?{' '}
            <Link to="/login" className="text-cricket font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
