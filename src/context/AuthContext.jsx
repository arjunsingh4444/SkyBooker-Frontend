import React, { createContext, useContext, useState, useEffect } from 'react';
import { authClient } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('skybooker_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('skybooker_token', token);
      fetchUserProfile();
    } else {
      localStorage.removeItem('skybooker_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      // Assuming GET /api/Auth/profile gets the logged in user profile based on JWT
      const res = await authClient.get('/Auth/profile');
      if (res.data.success) {
        setUser(res.data.data);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await authClient.post('/Auth/login', { email, password });
      if (res.data.success) {
        setToken(res.data.data.token);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password.';
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    const res = await authClient.post('/Auth/register', userData);
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
