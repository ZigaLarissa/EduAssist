import { View, Text } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { StudentsListScreen } from "../../screens/studentListScreen"
import { StudentsFormScreen } from "../../screens/studentFormScreen"
import { ClassesScreen } from "../../screens/ClassesScreen"
import { HomeScreen } from "../../screens/HomeScreen"
import { AnnouncementFormScreen } from "../../screens/AnnouncementFormScreen"
import { ClassScreen } from "../../screens/ClassScreen"
import { HomeworkFormScreen } from '../../screens/HomeworkFormScreen'
import { StatusBar } from 'expo-status-bar'
import { createStackNavigator } from '@react-navigation/stack'


const Stack = createStackNavigator()

export default function Home() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Stack.Navigator initialRouteName="HomeScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ClassScreen" component={ClassScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="AnnouncementFormScreen" component={AnnouncementFormScreen} />
        <Stack.Screen name="StudentsListScreen" component={StudentsListScreen} />
        <Stack.Screen name="StudentsFormScreen" component={StudentsFormScreen} />
        <Stack.Screen name="ClassesScreen" component={ClassesScreen} />
        <Stack.Screen name="HomeworkFormScreen" component={HomeworkFormScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}