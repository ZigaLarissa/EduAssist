import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
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
  const [role, setRole] = useState(null);


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      // console.log("got user: ", user);
      if(user){
        setIsAuthenticated(true);
        setUser(user);
        updateUserData(user.uid);
      }else{
        setIsAuthenticated(false);
        setUser(null);
      }
    });
    return unsub;
  }, []);

  const updateUserData = async (userId) => {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      let data = docSnap.data();
      setRole(data.role);
      setUser({...user, username: data.username, userId: user.uid});
    }
  }

  // Sign Up New User
  const login = async (email, password) => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      return {success: true};
    } catch (e) {
      let msg = e.message;
      if(msg.includes("(auth/invalid-email)")) msg = "Invalid Email";
      if(msg.includes("(auth/invalid-credential)")) msg = "Wrong Credentials";
      return {success: false, msg};
    
    }
  };

  // Login User
  const logout = async () => {
    try {
      await signOut(auth);
      return {sucess: true};
    } catch (e) {
      return {sucess: false, msg: e.message, error: e}; 
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
      if(msg.includes("(auth/email-already-in-use)")) msg = "Email already in use";
      return {sucess: false, msg};
    }
  };

  return (
    <authContext.Provider value={{ user, isAuthenticated, role, login, register, logout }}>
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


  