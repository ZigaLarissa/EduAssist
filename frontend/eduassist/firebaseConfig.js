// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection } from "firebase/firestore";
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyCdo86vcKQWWHgEvh4HZJk4V1A1IoHRlNI",
  authDomain: "eduassist-eece5.firebaseapp.com",
  projectId: "eduassist-eece5",
  storageBucket: "eduassist-eece5.firebasestorage.app",
  messagingSenderId: "169594208390",
  appId: "1:169594208390:web:a1601d449c09a668a79107",
  measurementId: "G-Z71E6571PP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
})


export const db = getFirestore(app);

export const usersRef = collection(db, "users");
export const roomsRef = collection(db, "rooms");

export const storage = getStorage(app);