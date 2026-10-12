import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('veyro_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('veyro_token'));
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const isAdmin = user && user.roles && (user.roles.includes('ROLE_ADMIN') || user.roles.includes('ADMIN'));

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: jwtToken, user: userData } = response.data;

      localStorage.setItem('veyro_token', jwtToken);
      localStorage.setItem('veyro_user', JSON.stringify(userData));

      setToken(jwtToken);
      setUser(userData);
      showSuccess(`Welcome back, ${userData.fullName}!`);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      showError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { fullName, email, password });
      const { token: jwtToken, user: userData } = response.data;

      localStorage.setItem('veyro_token', jwtToken);
      localStorage.setItem('veyro_user', JSON.stringify(userData));

      setToken(jwtToken);
      setUser(userData);
      showSuccess(`Account created! Welcome to VEYRO, ${userData.fullName}!`);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      showError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('veyro_token');
    localStorage.removeItem('veyro_user');
    setToken(null);
    setUser(null);
    showSuccess('You have been logged out.');
  };

  const updateCurrentUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('veyro_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isAdmin,
        loading,
        login,
        register,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
