import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';

// Example screens for parents — replace with your actual ones
import ParentHomeScreen from '../../../screens/parent/ParentHomeScreen';
import GradesScreen from '../../../screens/parent/GradesScreen';
import HomeworkListScreen from '../../../screens/parent/HomeworkListScreen';
import AnnouncementsScreen from '../../../screens/parent/AnnouncementsScreen';
import ChatScreen from '../../../screens/parent/ChatScreen';

const Stack = createStackNavigator();

export default function ParentStack() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Stack.Navigator initialRouteName="ParentHomeScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ParentHomeScreen" component={ParentHomeScreen} />
        <Stack.Screen name="GradesScreen" component={GradesScreen} />
        <Stack.Screen name="HomeworkListScreen" component={HomeworkListScreen} />
        <Stack.Screen name="AnnouncementsScreen" component={AnnouncementsScreen} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
