import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, getDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

class ChatService {
  // Get the current user
  getCurrentUser = () => {
    return auth.currentUser;
  }

  // Get user details from db
  getUserDetails = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data();
      } else {
        console.log('No such user!');
        return null;
      }
    } catch (error) {
      console.error('Error getting user details:', error);
      return null;
    }
  }

  // Create a new chat or get existing chat between two users
  createOrGetChat = async (otherUserId) => {
    const currentUserId = this.getCurrentUser()?.uid;
    if (!currentUserId) throw new Error('User not authenticated');

    // Check if a chat already exists between these users
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', currentUserId)
    );

    try {
      const querySnapshot = await getDocs(q);
      // Look for a chat that contains both users
      let existingChat = null;
      
      querySnapshot.forEach((doc) => {
        const chatData = doc.data();
        if (chatData.participants && 
            chatData.participants.includes(currentUserId) && 
            chatData.participants.includes(otherUserId)) {
          existingChat = { id: doc.id, ...chatData };
        }
      });

      if (existingChat) {
        return existingChat;
      }

      // If no chat exists, create a new one
      const [currentUserData, otherUserData] = await Promise.all([
        this.getUserDetails(currentUserId),
        this.getUserDetails(otherUserId)
      ]);

      // Create chat participants info
      const participantsInfo = [
        {
          id: currentUserId,
          displayName: currentUserData?.username || 'User',
          photoURL: currentUserData?.photoURL || null
        },
        {
          id: otherUserId,
          displayName: otherUserData?.username || 'User',
          photoURL: otherUserData?.photoURL || null
        }
      ];

      // Create new chat document
      const newChatRef = await addDoc(chatsRef, {
        participants: [currentUserId, otherUserId],
        participantsInfo: participantsInfo,
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        lastMessageSenderId: ''
      });

      return {
        id: newChatRef.id,
        participants: [currentUserId, otherUserId],
        participantsInfo: participantsInfo
      };
    } catch (error) {
      console.error('Error creating/getting chat:', error);
      throw error;
    }
  }

  // Get all chats for current user
  getUserChats = (callback) => {
    const currentUserId = this.getCurrentUser()?.uid;
    if (!currentUserId) return () => {};

    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', currentUserId),
      orderBy('lastMessageTime', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const chats = [];
      querySnapshot.forEach((doc) => {
        chats.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(chats);
    }, (error) => {
      console.error('Error getting chats:', error);
      callback([]);
    });
  }

  // Get messages for a specific chat
  getChatMessages = (chatId, callback) => {
    if (!chatId) return () => {};

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    return onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(messages);
    }, (error) => {
      console.error('Error getting messages:', error);
      callback([]);
    });
  }

  // Send a message in a chat
  sendMessage = async (chatId, messageText) => {
    const currentUser = this.getCurrentUser();
    if (!currentUser || !chatId || !messageText.trim()) return;

    try {
      // Add message to the subcollection
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        text: messageText.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'User',
        timestamp: serverTimestamp()
      });

      // Update the chat document with last message info
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: messageText.trim(),
        lastMessageTime: serverTimestamp(),
        lastMessageSenderId: currentUser.uid
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get teachers or parents to chat with
  getPossibleChatUsers = async (userType = 'all') => {
    try {
      const usersRef = collection(db, 'users');
      let q;
      
      // Only filter by role if a specific type is requested
      if (userType === 'teachers') {
        q = query(usersRef, where('role', '==', 'teacher'));
      } else if (userType === 'parents') {
        q = query(usersRef, where('role', '==', 'parent'));
      } else if (userType === 'parents') {
        q = query(usersRef, where('role', '==', 'parent'));
      } else {
        // When userType is 'all' or any other value, get all users
        q = query(usersRef);
      }
      
      const querySnapshot = await getDocs(q);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        // Don't include current user
        if (doc.id !== this.getCurrentUser()?.uid) {
          users.push({
            id: doc.id,
            displayName: userData.username || 'User',
            photoURL: userData.photoURL || null,
            role: userData.role || 'unknown'
          });
        }
      });
      
      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }
}

export default new ChatService();