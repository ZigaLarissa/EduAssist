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
import { Octicons, Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';


const groupMessagesByDate = (messages) => {
  const groupedMessages = [];
  let currentDate = null;

  messages.forEach((message) => {
    const messageDate = message.timestamp?.toDate().toLocaleDateString();

    if (messageDate !== currentDate) {
      currentDate = messageDate;
      groupedMessages.push({
        date: currentDate,
        messages: [],
      });
    }

    // Add the message to the corresponding date group
    groupedMessages[groupedMessages.length - 1].messages.push(message);
  });

  return groupedMessages;
};


const renderDateHeader = (date) => (
  <View style={styles.dateHeader}>
    <Text style={styles.dateText}>{date}</Text>
  </View>
);


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

  const groupedMessages = groupMessagesByDate(messages);

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
        <Text style={styles.timeStamp}>
          {item.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={wp('6%')} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
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
          data={groupedMessages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <>
              {renderDateHeader(item.date)}
              {item.messages.map((msg, index) => (
                <React.Fragment key={msg.id || index}>
                  {renderMessage({ item: msg })}
                </React.Fragment>
              ))}
            </>
          )}
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
    paddingBottom: hp('2%'),
    paddingVertical: hp('6%'),
    backgroundColor: '#d20505',
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
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: 'white',
    paddingLeft: wp('2%'),
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
  dateHeader: {
    backgroundColor: '#f0f0f0',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('1%'),
    marginVertical: hp('1%'),
    marginHorizontal: hp('17%'),
    alignItems: 'center',
    borderRadius: wp('3%'),
  },
  dateText: {
    fontSize: wp('2.5%'),
    fontWeight: 'bold',
    color: '#757575',
  },
  messagesList: {
    padding: wp('4%'),
  },
  messageContainer: {
    maxWidth: wp('85%'),
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
  timeStamp: {
    fontSize: wp('3%'),
    color: '#757575',
    alignSelf: 'flex-end',
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
    color: '#d20505',
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
    borderTopColor: '#d20505',
  },
  tabText: {
    fontSize: wp('3%'),
  },
  activeTabText: {
    color: '#d20505',
  },
});

export { ChatScreen };