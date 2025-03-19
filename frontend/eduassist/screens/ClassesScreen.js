import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  TextInput,
  Alert,
  SafeAreaView,
  Modal,
  ActivityIndicator
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from "../firebaseConfig";
import { Octicons, Feather } from '@expo/vector-icons';
import { useAuth } from '../context/authContext';

const ClassesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [joinedClasses, setJoinedClasses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [activeTab, setActiveTab] = useState('joined'); // 'joined' or 'available'

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        if (!user || !user.uid) return;

        // Get joined classes (classes where the user is in teacherIds)
        const joinedClassesQuery = query(
          collection(db, 'classes'),
          where('teacherIds', 'array-contains', user.uid)
        );
        
        const joinedClassesSnapshot = await getDocs(joinedClassesQuery);
        const joinedClassesList = joinedClassesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setJoinedClasses(joinedClassesList);
        
        // Get all classes the user hasn't joined yet
        // Note: Firestore doesn't support not-in queries with array-contains
        // So we fetch all classes and filter them client-side
        const allClassesQuery = query(collection(db, 'classes'));
        const allClassesSnapshot = await getDocs(allClassesQuery);
        
        const availableClassesList = allClassesSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(classItem => 
            // Filter out classes the user has already joined
            !classItem.teacherIds.includes(user.uid)
          );
        
        setAvailableClasses(availableClassesList);
      } catch (error) {
        console.error('Error fetching classes: ', error);
        Alert.alert('Error', 'Failed to load classes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClasses();
  }, [user]);

  // Handle creating a new class
  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      Alert.alert('Error', 'Please enter a class name');
      return;
    }

    try {
      const newClass = {
        name: newClassName.trim(),
        teacherIds: [user.uid],  // Array of teacher IDs
        createdAt: new Date().toISOString(),
        createdBy: user.uid      // Track who created the class
      };

      const docRef = await addDoc(collection(db, 'classes'), newClass);
      
      // Add the new class to the state with its ID
      setJoinedClasses([...joinedClasses, { id: docRef.id, ...newClass }]);
      
      // Reset form and close modal
      setNewClassName('');
      setModalVisible(false);
      
      Alert.alert('Success', `Class "${newClassName}" created successfully`);
    } catch (error) {
      console.error('Error creating class: ', error);
      Alert.alert('Error', 'Failed to create class');
    }
  };

  // Handle joining a class
  const handleJoinClass = async (classItem) => {
    try {
      const classRef = doc(db, 'classes', classItem.id);
      
      // Add the user to the teacherIds array
      await updateDoc(classRef, {
        teacherIds: [...classItem.teacherIds, user.uid]
      });
      
      // Update local state
      setJoinedClasses([...joinedClasses, {...classItem, teacherIds: [...classItem.teacherIds, user.uid]}]);
      setAvailableClasses(availableClasses.filter(c => c.id !== classItem.id));
      
      Alert.alert('Success', `You have joined "${classItem.name}"`);
    } catch (error) {
      console.error('Error joining class: ', error);
      Alert.alert('Error', 'Failed to join class');
    }
  };

  // Navigate to students list for a specific class
  const handleSelectClass = (classItem) => {
    navigation.navigate('StudentsListScreen', {
      classId: classItem.id,
      className: classItem.name
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        {/* <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.menuButton}>
            <Text style={styles.menuButtonText}>←</Text>
          </TouchableOpacity>
          
        </View> */}
        
        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'joined' && styles.activeTabClass]}
            onPress={() => setActiveTab('joined')}
          >
            <Text style={[styles.tabText, activeTab === 'joined' && styles.activeTabText]}>My Classes</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'available' && styles.activeTabClass]}
            onPress={() => setActiveTab('available')}
          >
            <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>Available Classes</Text>
          </TouchableOpacity>
        </View>
        
        {/* Add Class Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Create New Class</Text>
        </TouchableOpacity>
        
        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#d20505" />
            {/* <Text style={styles.loadingText}>Loading classes...</Text> */}
          </View>
        )}
        
        {/* Joined Classes List */}
        {activeTab === 'joined' && !loading && (
          <View style={styles.classesList}>
            <Text style={styles.listTitle}>My Classes</Text>
            
            {joinedClasses.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>You haven't joined any classes yet. Create a class or join an existing one!</Text>
              </View>
            ) : (
              joinedClasses.map((classItem) => (
                <TouchableOpacity 
                  key={classItem.id} 
                  style={styles.classCard}
                  onPress={() => handleSelectClass(classItem)}
                >
                  <View style={styles.classIconContainer}>
                    <Feather name="users" size={24} color="#d20505" />
                  </View>
                  <View style={styles.classInfo}>
                    <Text style={styles.className}>{classItem.name}</Text>
                    <Text style={styles.classDetails}>
                      {classItem.createdBy === user.uid ? 'Created by you' : 'Joined'}
                    </Text>
                  </View>
                  <Text style={styles.arrowRight}>›</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
        
        {/* Available Classes List */}
        {activeTab === 'available' && !loading && (
          <View style={styles.classesList}>
            <Text style={styles.listTitle}>Available Classes</Text>
            
            {availableClasses.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No available classes to join at the moment.</Text>
              </View>
            ) : (
              availableClasses.map((classItem) => (
                <View key={classItem.id} style={styles.classCard}>
                  <View style={styles.classIconContainer}>
                    <Feather name="users" size={24} color="#666" />
                  </View>
                  <View style={styles.classInfo}>
                    <Text style={styles.className}>{classItem.name}</Text>
                    <Text style={styles.classDetails}>
                      {classItem.teacherIds.length} teacher(s)
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.joinButton}
                    onPress={() => handleJoinClass(classItem)}
                  >
                    <Text style={styles.joinButtonText}>Join</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
      
      {/* Add Class Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Class</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Class Name (e.g. Primary 1, Nursery 2)"
              value={newClassName}
              onChangeText={setNewClassName}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateClass}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Bottom Navigation */}
      <View style={styles.tabBar}>
              <TouchableOpacity 
                style={styles.tabItem}
                onPress={() => navigation.navigate('HomeScreen')}
              >
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
                  style={styles.tabItem}
                  onPress={() => navigation.navigate('ChatListScreen')}
                >
                  <Octicons name="comment-discussion" size={24} color="#666" />
                  <Text style={styles.tabLabel}>Chats</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.tabItem, styles.activeTab]}
                  onPress={() => navigation.navigate('StudentsListScreen')}
                  >
                  <Octicons name="gear" size={24} color="#d20505" />
                  <Text style={[styles.tabLabel, styles.activeTabLabel]}>Settings</Text>
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
  scrollView: {
    flex: 1,
    paddingTop: hp('5%'),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('1%'),
    paddingVertical: hp('5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    backgroundColor: 'white',
  },
  menuButton: {
    padding: wp('2%'),
  },
  menuButtonText: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    marginLeft: wp('3%'),
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: wp('5%'),
    marginVertical: hp('1%'),
    borderRadius: wp('3%'),
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: hp('1.5%'),
    alignItems: 'center',
  },
  activeTabClass: {
    backgroundColor: '#d20505',
  },
  tabText: {
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  listTitle: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    marginBottom: hp('1%'),
  },
  loadingContainer: {
    padding: wp('10%'),
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp('1%'),
    color: '#666',
  },
  addButton: {
    backgroundColor: '#d20505',
    borderRadius: wp('3%'),
    padding: wp('3%'),
    alignItems: 'center',
    marginHorizontal: wp('5%'),
    marginVertical: hp('2%'),
  },
  addButtonText: {
    color: 'white',
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
  classesList: {
    padding: wp('5%'),
  },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: wp('3%'),
    padding: wp('3%'),
    marginBottom: hp('2%'),
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.1,
    // shadowRadius: 2,
    // elevation: 2,
  },
  classIconContainer: {
    backgroundColor: '#fff9f9',
    padding: wp('3%'),
    borderRadius: wp('8%'),
  },
  classInfo: {
    flex: 1,
    marginLeft: wp('3%'),
  },
  className: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
  },
  classDetails: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginTop: hp('0.5%'),
  },
  arrowRight: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: '#666',
  },
  joinButton: {
    backgroundColor: '#d20505',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: wp('3.5%'),
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp('10%'),
    backgroundColor: 'white',
    borderRadius: wp('3%'),
    marginVertical: hp('2%'),
  },
  emptyStateText: {
    fontSize: wp('4%'),
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: wp('3%'),
    padding: wp('5%'),
    width: wp('80%'),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    marginBottom: hp('2%'),
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: wp('3%'),
    padding: wp('3%'),
    fontSize: wp('4%'),
    width: '100%',
    marginBottom: hp('2%'),
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: hp('2%'),
  },
  modalButton: {
    borderRadius: wp('3%'),
    padding: wp('3%'),
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#d20505',
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingVertical: hp('1.5%'),
    backgroundColor: 'white',
  },
  navButton: {
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: wp('6%'),
    marginBottom: hp('0.5%'),
  },
  navText: {
    fontSize: wp('3%'),
    color: '#666',
  },
  activeNavText: {
    color: '#d20505',
    fontWeight: 'bold',
  },
  activeNavIcon: {
    color: '#d20505',
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
    borderTopColor: '#d20505',
  },
  tabLabel: {
    fontSize: wp('3.2%'),
    marginTop: hp('0.5%'),
    color: '#999',
  },
  activeTabLabel: {
    color: '#d20505',
  },
});

export { ClassesScreen };