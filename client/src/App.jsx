import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import OfflinePage from './components/OfflinePage';
import Loader from './components/Loader';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import CreateMatch from './pages/CreateMatch';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <Loader text="Getting your stats..." />;
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label="cricket">🏏</span>
              <span className="text-xl font-bold bg-gradient-to-r from-cricket to-cricket-dark bg-clip-text text-transparent">
                CricBuddy
              </span>
            </Link>
          </div>
          
          <div className="hidden sm:flex items-center space-x-8">
            {user ? (
              <>
                <Link 
                  to="/" 
                  className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-cricket' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/create-match" 
                  className={`text-sm font-medium transition-colors ${isActive('/create-match') ? 'text-cricket' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Organize Match
                </Link>
                <Link 
                  to="/profile" 
                  className={`text-sm font-medium transition-colors ${isActive('/profile') ? 'text-cricket' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Profile
                </Link>
                <button 
                  onClick={logout} 
                  className="btn-secondary text-sm !py-1.5 !px-4"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-700">Login</Link>
                <Link to="/signup" className="btn-primary text-sm !py-1.5 !px-6">Sign Up</Link>
              </>
            )}
          </div>

          <div className="sm:hidden flex items-center gap-4">
             {user && (
               <Link to="/profile" className="text-sm font-medium text-cricket truncate max-w-[80px]">
                 {user.name.split(' ')[0]}
               </Link>
             )}
             <button onClick={user ? logout : undefined} className="text-gray-500">
                {user ? 'Logout' : <Link to="/login">Login</Link>}
             </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      setIsOffline(false);
    } else {
      console.log('Still offline, retry failed.');
    }
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {isOffline && <OfflinePage onRetry={handleRetry} />}
          <Navbar />
          <main className="py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              <Route path="/create-match" element={
                <PrivateRoute>
                  <CreateMatch />
                </PrivateRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
