import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { useContext } from 'react';
import { createContext, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { auth } from '../firebaseConfig';

export const authContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if(user){
        setIsAuthenticated(true);
        setUser(user);
      }else{
        setIsAuthenticated(false);
        setUser(null);
      }
    });
    return unsub;
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
  const register = async (email, password, username) => {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      console.log("response.user: ", response?.user);

      await setDoc(doc(db, "users", response?.user?.uid),{
        username,
        userId: response?.user?.uid
      });
      return {sucess: true, data: response?.user};
    } catch (e) {
      let msg = e.message;
      if(msg.includes("(auth/invalid-email)")) msg = "Invalid Email";
      if(msg.includes("(auth/weak-password)")) msg = "Password should be at least 6 characters";
      return {sucess: false, msg};
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


  