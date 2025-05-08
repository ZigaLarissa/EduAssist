// components/BottomNav.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Octicons, Feather } from '@expo/vector-icons';

export default function BottomNav({ activeTab, role = "parent" }) {
  const navigation = useNavigation();

  return (
    <View style={styles.tabBar}>
      <TouchableOpacity
        onPress={() => navigation.navigate('HomeScreen')}
        style={styles.tabItem}
      >
        <Octicons name="home" size={24} color={activeTab === 'home' ? '#d20505' : '#666'} />
        <Text style={[styles.tabLabel, activeTab === 'home' && styles.activeTabLabel]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate(role === 'teacher' ? 'HomeworkFormScreen' : 'ResourcesScreen')}
        style={styles.tabItem}
      >
        <Feather name="folder" size={24} color={activeTab === 'resources' ? '#d20505' : '#666'} />
        <Text style={[styles.tabLabel, activeTab === 'resources' && styles.activeTabLabel]}>Resources</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('ChatListScreen')}
        style={styles.tabItem}
      >
        <Octicons name="comment-discussion" size={24} color={activeTab === 'chats' ? '#d20505' : '#666'} />
        <Text style={[styles.tabLabel, activeTab === 'chats' && styles.activeTabLabel]}>Chats</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('SettingsScreen')}
        style={styles.tabItem}
      >
        <Octicons name="gear" size={24} color={activeTab === 'settings' ? '#d20505' : '#666'} />
        <Text style={[styles.tabLabel, activeTab === 'settings' && styles.activeTabLabel]}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  tabItem: {
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
  },
  activeTabLabel: {
    color: '#d20505',
    fontWeight: 'bold',
  },
});
