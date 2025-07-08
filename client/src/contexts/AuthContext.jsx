import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { AUTH_STORAGE_KEY } from '../constants/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem(AUTH_STORAGE_KEY);
    if (token) {
      authAPI.getProfile()
        .then(data => {
          setUser(data.user);
        })
        .catch(err => {
          console.error('Failed to get user profile:', err);
          localStorage.removeItem(AUTH_STORAGE_KEY);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      const data = await authAPI.login(credentials);
      localStorage.setItem(AUTH_STORAGE_KEY, data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const data = await authAPI.register(userData);
      localStorage.setItem(AUTH_STORAGE_KEY, data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setError(null);
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const data = await authAPI.updateProfile(profileData);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      return await authAPI.forgotPassword(email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setError(null);
      return await authAPI.resetPassword(token, password);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
    clearError,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 