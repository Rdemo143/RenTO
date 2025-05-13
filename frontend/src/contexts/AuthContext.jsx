import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, registerUser, getCurrentUser, verifyToken, refreshToken, updateUserProfile, changePassword } from '../services/api';

// Export the context so it can be imported directly
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Track initial loading state

  useEffect(() => {
    // Check for token on initial load
    const token = localStorage.getItem('authToken');
    if (token) {
      // Validate token with backend and fetch user data
      verifyToken()
        .then(userData => {
          setUser(userData);
        })
        .catch(() => {
          // Token is invalid or expired
          localStorage.removeItem('authToken');
          setUser(null);
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
      const data = await loginUser(credentials);
      localStorage.setItem('authToken', data.token);
      setUser(data);
      return data; // Return user data on successful login
    } catch (error) {
      console.error('Login failed:', error.message || error);
      throw error; // Re-throw error to be handled by the caller
    }
  };

  const register = async (userData) => {
    try {
      const data = await registerUser(userData);
      // Optionally log the user in immediately after registration
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        setUser(data);
      }
      return data; // Return response data
    } catch (error) {
      console.error('Registration failed:', error.message || error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    // Optional: Notify backend about logout if needed
  };

  const updateProfile = async (userData) => {
    try {
      const updatedUser = await updateUserProfile(userData);
      setUser(prev => ({ ...prev, ...updatedUser }));
      return updatedUser;
    } catch (error) {
      console.error('Profile update failed:', error.message || error);
      throw error;
    }
  };

  const updatePassword = async (passwordData) => {
    try {
      return await changePassword(passwordData);
    } catch (error) {
      console.error('Password change failed:', error.message || error);
      throw error;
    }
  };

  const refreshUserToken = async () => {
    try {
      const data = await refreshToken();
      localStorage.setItem('authToken', data.token);
      setUser(data);
      return data;
    } catch (error) {
      console.error('Token refresh failed:', error.message || error);
      // If token refresh fails, log the user out
      logout();
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading, // Provide loading state
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    refreshUserToken
  };

  // Render children only after initial loading is complete
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
