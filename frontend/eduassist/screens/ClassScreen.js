import React, { useEffect, useState, useContext } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    FlatList, 
    Image, 
    StyleSheet,
    ScrollView,
    ActivityIndicator, 
} from 'react-native';
import { Feather, Octicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { useAuth } from '../context/authContext';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Modal } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc } from 'firebase/firestore';



const ClassScreen = ({ route, navigation }) => {
  const { classId, className } = route.params;
//   const navigation = useNavigation();
  const { user } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [homeworks, setHomeworks] = useState([]);
  const [resources, setResources] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingHomeworks, setLoadingHomeworks] = useState(true);
  

  useEffect(() => {
    fetchSubjects();
    fetchHomework();
    addSubject();
  }, []);


  //not in the useEffect
  const addSubject = async () => {
    if (!newSubject || !newSubject.trim()) {
      Alert.alert("Error", "Please enter a new subject");
      return;
    }

    try {
        const subjectData = {
            name: newSubject.trim(),
            classId: classId,
            teacherId: user.uid,  // teacher ID
            createdAt: new Date().toISOString(),
        };
        
        const docRef = await addDoc(collection(db, 'subjects'), subjectData);

        setSubjects([...subjects, { id: docRef.id, ...subjectData }]);
      
        // Reset form and close modal
        setNewSubject('');
        setModalVisible(false);  

    } catch (error) {
          console.error('Error creating subject: ', error);
          Alert.alert('Error', 'Failed to create subject');
    }
  };

  const fetchSubjects = async () => {
    try {
        setLoadingSubjects(true);

        if (!user || !user.uid) return;

        const q = query(
            collection(db, 'subjects'), 
            where('classId', '==', classId),
            where('teacherId', '==', user.uid)
        );

        const querySnapshot = await getDocs(q);

        const subjectsList = querySnapshot.docs.map(doc => ({
             id: doc.id, 
             ...doc.data() 
        }));

        setSubjects(subjectsList);

    } catch (error) {
        console.error('Error fetching subjects: ', error);
        Alert.alert('Error', 'Failed to load subjects');

    } finally {
        setLoadingSubjects(false);
    }
  };


  const renderSubjectItem = ({ item }) => (
      <TouchableOpacity 
        style={styles.classCard}
        // onPress={() => navigation.navigate("ClassScreen", { classId: item.id, className: item.name })}
      >
        <View style={styles.classInfo}>
          <Text style={styles.className}>{item.name}</Text>
          {/* <Text style={styles.classDescription}>{item.description || 'No description'}</Text> */}
        </View>
      </TouchableOpacity>
  );

  const fetchHomework = async () => {
    try {
        setLoadingHomeworks(true);

        const q = query(
            collection(db, 'homeworks'), 
            where('classIds', 'array-contains', classId)
        );

        const querySnapshot = await getDocs(q);

        const homeworkList = querySnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        }));

        setHomeworks(homeworkList);
    
        // Extract resources from past homework
        // const resourcesList = homeworkList.flatMap(hw => hw.resources || []);
        // setResources(resourcesList);
    } catch (error) {
        console.error('Error fetching homeworks: ', error);
        Alert.alert('Error', 'Failed to load homeworks');
    } finally {
        setLoadingHomeworks(false);
    }
    
  };

  const formatDate = (date) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={wp('6%')} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{className} - <Text style={styles.redText}>Resources</Text></Text>
          <View style={styles.placeholderRight} />
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Subjects in {className}</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Feather name="plus" size={wp('5%')} color="#e74c3c" />
            </TouchableOpacity>
          </View>

          {loadingSubjects ? (
            <ActivityIndicator size="large" color="#e74c3c" style={styles.loader} />
          ) : subjects.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                No subjects available. Click the + button to create a new subject.
              </Text>
            </View>
          ) : (
            <FlatList
              data={subjects}
              renderItem={renderSubjectItem}
              keyExtractor={item => item.id}
              horizontal={false}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              contentContainerStyle={styles.classesList}
            />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Homeworks</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('HomeworkFormScreen')}
            >
              <Feather name="plus" size={wp('5%')} color="#e74c3c" />
            </TouchableOpacity>
          </View>
          
          {loadingHomeworks ? (
            <ActivityIndicator size="large" color="#e74c3c" style={styles.loader} />
          ) : homeworks.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                No homeworks yet. Click the + button to create a new homework.
              </Text>
            </View>
          ) : (
            homeworks.map(homework => (
              <TouchableOpacity key={homework.id} style={styles.announcementCard}
                onPress={() => navigation.navigate('HomeworkViewScreen', { assignmentId : homework.id})}
              >
                {homework.imageUrl && (
                  <Image 
                    source={{ uri: homework.imageUrl }} 
                    style={styles.announcementImage}
                  />
                )}
                <View style={styles.announcementContent}>
                  <Text style={styles.announcementTitle}>{homework.title}</Text>
                  <Text style={styles.announcementText}>
                    {homework.text.length > 100 
                      ? homework.text.substring(0, 100) + '...' 
                      : homework.text}
                  </Text>
                  <Text style={styles.announcementDate}>
                    {formatDate(homework.createdAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Subject Modal */}
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
              placeholder="Class Name (e.g. Math, English)"
              value={newSubject}
              onChangeText={setNewSubject}
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
                onPress={addSubject}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('HomeScreen')}
        >
            <Octicons name="home" size={24} color="#666" />
            <Text style={styles.tabLabel}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabItem, styles.activeTab]}
            onPress={() => navigation.navigate('ClassScreen')}
          >
            <Feather name="folder" size={24} color="#e74c3c" />
            <Text style={[styles.tabLabel, styles.activeTabLabel]}>Resources</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tabItem}>
            <Octicons name="comment-discussion" size={24} color="#666" />
            <Text style={styles.tabLabel}>Chats</Text>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: wp('2%'),
  },
  headerTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
  },
  redText: {
    color: '#e74c3c',
  },
  placeholderRight: {
    width: wp('10%'),
  },
  container: {
    flex: 1,
  },
  section: {
    marginBottom: hp('3%'),
    paddingHorizontal: wp('5%'),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp('2%'),
    marginBottom: hp('1.5%'),
  },
  sectionTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    padding: wp('3%'),
    marginBottom: hp('1.5%'),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  classAvatar: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    marginRight: wp('3%'),
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
  classDescription: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginTop: hp('0.5%'),
  },
  announcementCard: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    marginBottom: hp('2%'),
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  announcementImage: {
    width: '100%',
    height: hp('20%'),
  },
  announcementContent: {
    padding: wp('4%'),
  },
  announcementTitle: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    marginBottom: hp('1%'),
  },
  announcementText: {
    fontSize: wp('3.8%'),
    color: '#555',
    marginBottom: hp('1%'),
  },
  announcementDate: {
    fontSize: wp('3.5%'),
    color: '#888',
    alignSelf: 'flex-end',
  },
  loader: {
    marginVertical: hp('3%'),
  },
  emptyStateContainer: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    padding: wp('5%'),
    marginVertical: hp('1%'),
    alignItems: 'center',
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
    backgroundColor: '#e74c3c',
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
  classesList: {
    paddingBottom: hp('1%'),
  },
})

export { ClassScreen };
