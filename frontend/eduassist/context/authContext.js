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

    setTimeout(() => {
      setIsAuthenticated(true);
    }, 3000);
  }, []);

  // Sign Up New User
  const signUp = async (email, password) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // Login User
  const login = async (email, password) => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // Logout User
  const logout = async () => {
    try {
      await auth().signOut();
    } catch (error) {
      throw error;
    }
  };

  return (
    <authContext.Provider value={{ user, isAuthenticated, signUp, login, logout }}>
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


  