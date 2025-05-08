import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import ChatService from '../../context/chatService';
import { Octicons, Feather } from '@expo/vector-icons';



const NewChatScreen = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState('all'); // 'all', 'teachers', 'parents'
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersList = await ChatService.getPossibleChatUsers(userType);
        setUsers(usersList);
        setFilteredUsers(usersList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userType]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(user => 
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const startChat = async (user) => {
    try {
      setLoading(true);
      const chat = await ChatService.createOrGetChat(user.id);
      navigation.navigate('ChatScreen', { 
        chatId: chat.id, 
        recipient: user 
      });
    } catch (error) {
      console.error('Error starting chat:', error);
      setLoading(false);
    }
  };

  const renderUserItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.userItem}
        onPress={() => startChat(item)}
      >
        <View style={styles.avatar} >
            <Octicons name="feed-person" size={32} color="#d20505" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.displayName}</Text>
          <Text style={styles.userRole}>{item.role}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={wp('6%')} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Chat</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            userType === 'all' && styles.activeFilter
          ]}
          onPress={() => setUserType('all')}
        >
          <Text style={styles.filterText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            userType === 'teachers' && styles.activeFilter
          ]}
          onPress={() => setUserType('teachers')}
        >
          <Text style={styles.filterText}>Teachers</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            userType === 'parents' && styles.activeFilter
          ]}
          onPress={() => setUserType('parents')}
        >
          <Text style={styles.filterText}>Parents </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d20505" />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.usersList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          }
        />
      )}
      
      
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
    justifyContent: 'space-between',
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
  headerTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: 'white',
  },
  searchContainer: {
    padding: wp('3%'),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: wp('3%'),
    padding: wp('2%'),
    fontSize: wp('4%'),
  },
  filterContainer: {
    flexDirection: 'row',
    padding: wp('2%'),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: wp('3%'),
    paddingVertical: wp('1%'),
    marginRight: wp('2%'),
    borderRadius: wp('2%'),
  },
  activeFilter: {
    backgroundColor: '#ffcdd2',
  },
  filterText: {
    fontSize: wp('3.5%'),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  usersList: {
    // paddingVertical: hp('1%'),
  },
  userItem: {
    flexDirection: 'row',
    padding: wp('3%'),
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  avatar: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('6%'),
    marginRight: wp('1%'),
    paddingVertical: hp('1%'),
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
  userRole: {
    fontSize: wp('3.5%'),
    color: '#757575',
  },
  emptyContainer: {
    padding: wp('5%'),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: wp('4%'),
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
    borderTopColor: '#d20505',
  },
  tabText: {
    fontSize: wp('3%'),
  },
  activeTabText: {
    color: '#d20505',
  },
});

export { NewChatScreen };