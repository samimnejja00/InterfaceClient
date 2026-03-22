import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // DEMO MODE - Always enabled
        const mockUser = {
          id: 'dev-user-123',
          email: 'demo@example.com',
          user_metadata: {}
        };
        const mockProfile = {
          id: 'dev-user-123',
          email: 'demo@example.com',
          name: 'Demo User',
          phone: '+33612345678',
          client_number: 'CLIENT-2024-001',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setUser(mockUser);
        setProfile(mockProfile);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const setAuthUser = (user, profile) => {
    setUser(user);
    setProfile(profile);
    setError(null);
  };

  const logout = async () => {
    try {
      // DEMO MODE - Just clear the state
      setUser(null);
      setProfile(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const value = {
    user,
    profile,
    loading,
    error,
    setAuthUser,
    logout,
    isAuthenticated: !!user,
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
