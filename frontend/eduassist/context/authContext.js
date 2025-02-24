import auth from '@react-native-firebase/auth';
import React, { useState } from 'react';
import { useContext } from 'react';
import { createContext, useEffect } from 'react';

export const authContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);

  useEffect(() => {
    // on auth state changed

    // setTimeout(() => {
      setIsAuthenticated(false);
    // }, 3000);
  }, []);

  // Sign Up New User
  const login = async (email, password) => {
    try {
      
    } catch (e) {
    
    }
  };

  // Login User
  const logout = async () => {
    try {
    
    } catch (e) {
    
    }
  };

  // Logout User
  const register = async (email, password) => {
    try {
    
    } catch (e) {
    
    }
  };

  return (
    <authContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </authContext.Provider>
  );
}

export const useAuth = () => {
  const value = useContext(authContext);

  if (!value) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }

  return value;
}


  