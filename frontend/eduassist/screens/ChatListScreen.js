import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import ChatService from '../context/chatService';
import { Feather, Octicons } from '@expo/vector-icons';


const ChatListScreen = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    console.log("Setting up shat listener")
    // use the service to get chats
    const unsubscribe = ChatService.getUserChats((chatsList) => {
      console.log("chats received: ", chatsList.length)
      setChats(chatsList);
      setLoading(false);
    })

    return () => unsubscribe();
  }, []);

  const truncateMessage = (message, maxLength = 30) => {
    if (!message) return '';
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  const renderChatItem = ({ item }) => {
    // Get the other participant's info (assuming it's a 1-on-1 chat)
    const otherParticipant = item.participantsInfo?.find(
      p => p.id !== auth.currentUser?.uid
    ) || {};

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate('ChatScreen', { chatId: item.id, recipient: otherParticipant })}
      >
        <View style={styles.avatar} >
          <Octicons name="feed-person" size={32} color="#d32f2f" />
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.teacherName}>{otherParticipant.displayName || 'User'}</Text>
            <Text style={styles.timeStamp}>
              {item.lastMessageTime?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <Text style={styles.lastMessage}>{truncateMessage(item.lastMessage)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chats</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading chats...</Text>
        </View>
      ) : chats.length === 0 ?(
        <View style={styles.loadingContainer}>
          <Text>No chats yet. Start a conversation!</Text>
          <TouchableOpacity 
            style={styles.startChatButton}
            onPress={() => navigation.navigate('NewChatScreen')}
          >
            <Text style={styles.startChatButtonText}>Start New Chat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.container}>
          <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatList}
        />

        <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('NewChatScreen')}
          >
            <Feather name="plus" size={wp('5%')} color="white" />
        </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')} style={styles.tabItem}>
            <Octicons name="home" size={24} color="#666" />
            <Text style={styles.tabLabel}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.tabItem}
            onPress={() => navigation.navigate('HomeworkFormScreen')}
          >
            <Feather name="folder" size={24} color="#666" />
            <Text style={styles.tabLabel}>Resources</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabItem, styles.activeTab]}
            onPress={() => navigation.navigate('ChatListScreen')}
          >
            <Octicons name="comment-discussion" size={24} color="#e74c3c" />
            <Text style={[styles.tabLabel, styles.activeTabLabel]}>Chats</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigation.navigate('StudentsListScreen')}
            >
            <Octicons name="gear" size={24} color="#666" />
            <Text style={styles.tabLabel}>Settings</Text>
          </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('1%'),
    paddingVertical: hp('5%'),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#d32f2f',
  },
  addButton: {
    position: 'bottom',
    marginBottom: '5%',
    marginLeft: '85%',
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: '#d32f2f',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  backButton: {
    fontSize: wp('6%'),
    color: 'white',
    marginRight: wp('2%'),
  },
  headerTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatList: {
  },
  chatItem: {
    flexDirection: 'row',
    padding: wp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  avatar: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    marginRight: wp('1%'),
    paddingVertical: hp('1%'),
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('0.5%'),
  },
  teacherName: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
  timeStamp: {
    fontSize: wp('3%'),
    color: '#757575',
  },
  lastMessage: {
    fontSize: wp('3.5%'),
    color: '#757575',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    height: hp('8%'),
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#e74c3c',
  },
  tabLabel: {
    fontSize: wp('3.2%'),
    marginTop: hp('0.5%'),
    color: '#999',
  },
  activeTabLabel: {
    color: '#e74c3c',
  },
});

export { ChatListScreen };