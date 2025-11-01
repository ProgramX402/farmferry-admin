import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const AuthContext = createContext(null);

// Custom hook to easily consume the context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if token is valid (basic JWT format validation)
  const isTokenValid = (token) => {
    if (!token) return false;
    
    try {
      // Basic JWT format check (3 parts separated by dots)
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Check if token is expired (basic check)
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        console.log('Token expired');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('authToken');
      
      if (storedToken && isTokenValid(storedToken)) {
        setToken(storedToken);
        setIsAuthenticated(true);
      } else {
        // Clear invalid token
        if (storedToken) {
          console.log('Removing invalid token');
          localStorage.removeItem('authToken');
        }
        setToken(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // 1. Function to call upon successful login/signup API response
  const login = (newToken) => {
    if (!newToken) {
      console.error('No token provided to login');
      return false;
    }

    if (!isTokenValid(newToken)) {
      console.error('Invalid token provided to login');
      return false;
    }

    try {
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setIsAuthenticated(true);
      console.log('Login successful, token stored');
      return true;
    } catch (error) {
      console.error('Error storing token:', error);
      return false;
    }
  };

  // 2. Function to call on logout
  const logout = () => {
    try {
      localStorage.removeItem('authToken');
      setToken(null);
      setIsAuthenticated(false);
      console.log('Logout successful');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Get current token
  const getToken = () => {
    return token;
  };

  // Check if token is about to expire (within 5 minutes)
  const isTokenExpiringSoon = () => {
    if (!token) return false;
    
    try {
      const parts = token.split('.');
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      const fiveMinutes = 5 * 60;
      
      return payload.exp && (payload.exp - currentTime) < fiveMinutes;
    } catch {
      return false;
    }
  };

  const value = {
    isAuthenticated,
    token,
    login,
    logout,
    getToken,
    isTokenExpiringSoon,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};