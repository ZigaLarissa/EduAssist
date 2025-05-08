import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { Slot, useRouter, useSegments } from 'expo-router';
import '../global.css';
import { AuthContextProvider, useAuth } from '../context/authContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';


const MainLayout = () => {
  const {isAuthenticated, role} = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated or not
    if (typeof isAuthenticated === 'undefined' || typeof role === 'undefined') return;

    const inApp = segments[0] === '(app)';
    const inAuth = segments[0] === '(auth)';

    if (isAuthenticated && !inApp) {
      if (role === 'teacher') {
        router.replace('/(app)/teacher/home');
      } else if (role === 'parent') {
        router.replace('/(app)/parent/home');
      }

    } else if (!isAuthenticated && !inAuth) {
      // redirect to sign in
      router.replace('/(auth)/signIn');
    }
  }, [isAuthenticated, role]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthContextProvider>
        <MainLayout />
      </AuthContextProvider>
    </SafeAreaProvider>
  )
}