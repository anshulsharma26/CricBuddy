import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-100px)] px-4">
      <div className="card-base max-w-sm w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="text-center mb-6">
          <div className="text-2xl mb-1">🏏</div>
          <h2 className="text-lg font-bold text-dark">Welcome Back</h2>
          <p className="text-gray-500 text-xs">Log in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded text-xs mb-4 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-base">Email</label>
            <input 
              type="email" 
              className="input-field"
              placeholder="name@example.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="label-base">Password</label>
            <input 
              type="password" 
              className="input-field"
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary w-full mt-2" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Logging in...
              </span>
            ) : 'Log In'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-xs">
            Don't have an account?{' '}
            <Link to="/signup" className="text-cricket font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
