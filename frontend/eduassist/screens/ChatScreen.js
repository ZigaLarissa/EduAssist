// --- ChatScreen.js ---
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import ChatService from '../context/chatService';
import { Octicons, Ionicons, MaterialIcons } from '@expo/vector-icons';


const ChatScreen = ({ route, navigation }) => {
  const { chatId, recipient } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  useEffect(() => {
    // use the service to get messages
    const unsubscribe = ChatService.getChatMessages(chatId, (messagesList) => {
        setMessages(messagesList);
        setLoading(false);
    })

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    try {
      await ChatService.sendMessage(chatId, inputText.trim());
      setInputText('');
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === auth.currentUser?.uid;
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.sentMessage : styles.receivedMessage
      ]}>
        <Text style={[
          styles.messageText,
          isCurrentUser ? styles.sentMessageText : styles.receivedMessageText
        ]}>
          {item.text}
        </Text>
        {/* <Text>{}</Text> */}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          {/* <Image 
            source={{ uri: recipient.photoURL || 'https://via.placeholder.com/40' }} 
            style={styles.avatar} 
          /> */}
          <Text style={styles.headerName}>{recipient.displayName || 'User'}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="call" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="video-call" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading messages...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => 
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => 
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Start a conversation..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.micButton}>
            <MaterialIcons name="keyboard-voice" size={24} color="black" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
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
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('1%'),
    paddingVertical: hp('5%'),
    backgroundColor: '#d32f2f',
  },
  backButton: {
    fontSize: wp('6%'),
    color: 'white',
    marginRight: wp('2%'),
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    marginRight: wp('2%'),
  },
  headerName: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: 'white',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: wp('3%'),
  },
  iconText: {
    fontSize: wp('5%'),
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: wp('4%'),
  },
  messageContainer: {
    maxWidth: wp('70%'),
    padding: wp('3%'),
    borderRadius: wp('3%'),
    marginBottom: hp('1%'),
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#ffcdd2',
    borderBottomRightRadius: 0,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: wp('4%'),
  },
  sentMessageText: {
    color: '#000',
  },
  receivedMessageText: {
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: wp('2%'),
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: hp('5%'),
    maxHeight: hp('15%'),
    backgroundColor: '#f5f5f5',
    borderRadius: wp('4%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: wp('2%'),
    fontSize: wp('4%'),
  },
  sendButton: {
    width: wp('10%'),
    height: wp('10%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: wp('6%'),
    color: '#d32f2f',
  },
  micButton: {
    width: wp('10%'),
    height: wp('10%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonText: {
    fontSize: wp('6%'),
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

export { ChatScreen };