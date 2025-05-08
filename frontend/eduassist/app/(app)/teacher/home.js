import { View, Text } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { NavigationIndependentTree } from '@react-navigation/native'


import { StudentsListScreen } from "../../../screens/teacher/studentListScreen"
import { StudentsFormScreen } from "../../../screens/teacher/studentFormScreen"
import { ClassesScreen } from "../../../screens/teacher/ClassesScreen"
import { HomeScreen } from "../../../screens/teacher/HomeScreen"
import { AnnouncementFormScreen } from "../../../screens/teacher/AnnouncementFormScreen"
import { ClassScreen } from "../../../screens/teacher/ClassScreen"
import { HomeworkFormScreen } from '../../../screens/teacher/HomeworkFormScreen'
import { StatusBar } from 'expo-status-bar'
import { createStackNavigator } from '@react-navigation/stack'
import { ChatListScreen } from '../../../screens/teacher/ChatListScreen'
import { ChatScreen } from '../../../screens/teacher/ChatScreen'
import { NewChatScreen } from '../../../screens/teacher/NewChatScreen'
import { HomeworkViewScreen } from '../../../screens/teacher/HomeworkViewScreen'
import { AnnouncementScreen } from '../../../screens/teacher/AnnouncementScreen'


const Stack = createStackNavigator()

export default function Home() {
  return (
    // <NavigationIndependentTree>
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
          <Stack.Screen name="ChatListScreen" component={ChatListScreen} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
          <Stack.Screen name="NewChatScreen" component={NewChatScreen} />
          <Stack.Screen name="HomeworkViewScreen" component={HomeworkViewScreen} />
          <Stack.Screen name="AnnouncementScreen" component={AnnouncementScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    // </NavigationIndependentTree>
  )
}