import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService, profileService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await profileService.getMe();
          setUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const signup = async (userData) => {
    const response = await authService.signup(userData);
    return response.data; // Just return message about OTP
  };

  const verifyOtp = async (data) => {
    const response = await authService.verifyOtp(data);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const resendOtp = async (email) => {
    const response = await authService.resendOtp(email);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (userData) => {
    const response = await profileService.updateMe(userData);
    setUser(response.data);
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, verifyOtp, resendOtp, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
