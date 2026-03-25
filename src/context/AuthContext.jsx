import React, { createContext, useState, useContext, useEffect } from 'react';
import { getStoredClient, logoutClient } from '../services/clientApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    try {
      const stored = getStoredClient();
      if (stored) {
        setClient(stored.client);
      }
    } catch (err) {
      console.error('Auth init error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const setAuthClient = (clientData) => {
    setClient(clientData);
    setError(null);
  };

  const logout = () => {
    logoutClient();
    setClient(null);
  };

  const value = {
    client,
    loading,
    error,
    setAuthClient,
    logout,
    isAuthenticated: !!client,
    // Backward compatibility aliases
    user: client,
    profile: client,
    setAuthUser: (user, profile) => setAuthClient(profile || user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
