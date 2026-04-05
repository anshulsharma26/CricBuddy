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
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)] px-4 py-8">
      <div className="card-base max-w-lg w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🤝</div>
          <h2 className="text-2xl font-bold text-dark">Join the Squad</h2>
          <p className="text-gray-500 text-sm">Create your player profile and start connecting</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="label-base">Email Address</label>
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
              placeholder="Minimum 6 characters"
              value={formData.password} 
              onChange={handleChange} 
              required 
              minLength="6"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full py-3 mt-4" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Creating Profile...
              </span>
            ) : 'Sign Up Now'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-cricket font-semibold hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
