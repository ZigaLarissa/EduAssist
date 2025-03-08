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
import { auth, firestore } from '../firebase/config';
import { useNavigation } from '@react-navigation/native';

const ChatListScreen = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;

    const chatsRef = collection(firestore, 'chats');
    const q = query(
      chatsRef,
      // Filter chats where the current user is a participant
      // You might need to adjust this query based on your data structure
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chatsList = [];
      querySnapshot.forEach((doc) => {
        const chatData = doc.data();
        // Only include chats where the current user is a participant
        if (chatData.participants && chatData.participants.includes(currentUserId)) {
          chatsList.push({
            id: doc.id,
            ...chatData,
          });
        }
      });
      setChats(chatsList);
      setLoading(false);
    });

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
        <Image 
          source={{ uri: otherParticipant.photoURL || 'https://via.placeholder.com/50' }} 
          style={styles.avatar} 
        />
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
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatList}
        />
      )}
      
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabText}>Resources</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabText}>Settings</Text>
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
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    height: hp('7%'),
    backgroundColor: '#d32f2f',
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
    paddingVertical: hp('1%'),
  },
  chatItem: {
    flexDirection: 'row',
    padding: wp('3%'),
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  avatar: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    marginRight: wp('3%'),
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
    height: hp('8%'),
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#d32f2f',
  },
  tabText: {
    fontSize: wp('3%'),
  },
  activeTabText: {
    color: '#d32f2f',
  },
});

export { ChatListScreen };