import React, { useState, useEffect, act } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { collection, addDoc, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from "../../firebaseConfig";
import { Octicons } from '@expo/vector-icons';
import { StudentsFormScreen } from './studentFormScreen';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/authContext';
import { onSnapshot } from 'firebase/firestore';


// Students List Screen
const StudentsListScreen = ({ route, navigation }) => {
    // Access the authenticated user
    const { user, logout } = useAuth();


    const classId = route.params?.classId;
    const className = route.params?.className;
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleLogout = async () => {
      await logout();
    }
    
    // Fetch students for the class that belongs to the current user
    useEffect(() => {
      const fetchStudents = async () => {
        try {
          setLoading(true);
  
          const studentsQuery = query(
            collection(db, 'students'),
            where('classId', '==', classId)
          );
        
          // Real-time listener
          const unsubscribe = onSnapshot(studentsQuery, (snapshot) => {
            const studentsList = snapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .sort((a, b) => {
                // Extract numeric position values for sorting
                const posA = parseInt(a.position.split('/')[0]) || 0;
                const posB = parseInt(b.position.split('/')[0]) || 0;
                return posA - posB;
              });
        
            setStudents(studentsList);
            setLoading(false);
          });
        } catch (error){
          console.error('Error fetching students: ', error);
        } finally {
          setLoading(false);
        }
      };
      
      if (user && user.uid) {
        fetchStudents();
      }
    }, [classId, user]);
    
    // Handle Edit Student
    const handleEditStudent = (student) => {
      navigation.navigate('StudentsFormScreen', {
        student,
        classId,
        className,
        editMode: true
      });
    };
    
    // Handle Add Student
    const handleAddStudent = () => {
      navigation.navigate('StudentsFormScreen', {
        classId,
        className
      });
    };
    
    return (
      <SafeAreaView style={styles.container}>

        <ScrollView style={styles.scrollView}>
          {/* Class Button */}
          <View style={styles.classButton}>
            <Text style={styles.classButtonText}>Current Class:</Text>
            <Text style={styles.classButtonText}>{className}</Text>
          </View>

          <TouchableOpacity 
            style={styles.classButton} 
            onPress={() => {
              if (navigation) {
                navigation.navigate('ClassesScreen');
              } else {
                console.warn('Navigation is not available');
              }
            }}
          >
            <Text style={styles.classButtonText}>Change/Create/Join Class</Text>
            <Feather name="chevron-right" size={wp('5%')} style={styles.arrowRight} />
          </TouchableOpacity>
          
          {/* Students Section */}
          <View style={styles.studentsSection}>
            <View style={styles.studentsSectionHeader}>
              <Text style={styles.sectionTitle}>Students</Text>
              <TouchableOpacity 
                style={styles.addStudentButton}
                onPress={handleAddStudent}
              >
                <Text style={styles.addStudentButtonText}>Add Student</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#d20505" style={styles.loader} />
              ) : students.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateText}>
                    No students to show. Choose a class or/and add students in a class.
                  </Text>
                </View>
              ) : (     
                students.map((student, index) => (
                  <View key={student.id || index} style={styles.studentCard}>
                  <View style={styles.classIconContainer}>
                    <Feather name="user" size={24} color="#d20505" />
                  </View>
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>{`${student.surname} ${student.lastName}`}</Text>
                      <Text style={styles.studentPosition}>Position: {student.position}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => handleEditStudent(student)}
                    >
                      <Text style={styles.editButtonText}>✎</Text>
                    </TouchableOpacity>
                  </View>
                ))
                // </View>
              )
            }
            
    

            {/* Logout button */}
            <TouchableOpacity onPress={handleLogout}>
              <Text>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
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

  // Styles
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
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: wp('5%'),
    },
    // headerCenter: {
    //   flexDirection: "row",
    //   alignItems: "center",
    // },
    // logo: {
    //   width: wp("7%"),
    //   height: wp("7%"),
    //   marginRight: wp("2%"),
    // },
    // appName: {
    //   fontSize: wp("5%"),
    //   fontWeight: "bold",
    //   color: "#000",
    // },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconButton: {
      marginRight: wp('3%'),
    },
    avatarContainer: {
      borderRadius: wp('6%'),
      overflow: 'hidden',
    },
    avatar: {
      width: wp('10%'),
      height: wp('10%'),
      borderRadius: wp('5%'),
      backgroundColor: '#d20505',
      justifyContent: 'center',
      alignItems: 'center',
    },
    classButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#d20505',
      borderRadius: wp('5%'),
      paddingHorizontal: wp('5%'),
      paddingVertical: hp('2%'),
      marginHorizontal: wp('5%'),
      marginTop: hp('2%'),
    },
    classButtonText: {
      color: 'white',
      fontSize: wp('4.5%'),
      fontWeight: 'bold',
    },
    arrowRight: {
      color: 'white',
      fontSize: wp('6%'),
      fontWeight: 'bold',
    },
    formContainer: {
      padding: wp('5%'),
    },
    label: {
      fontSize: wp('4%'),
      marginTop: hp('2%'),
      marginBottom: hp('0.5%'),
      color: '#333',
    },
    input: {
      backgroundColor: 'white',
      borderRadius: wp('3%'),
      padding: wp('3%'),
      fontSize: wp('4%'),
      borderWidth: 1,
      borderColor: '#ddd',
    },
    parentInfoContainer: {
      marginTop: hp('1%'),
    },
    parentInput: {
      backgroundColor: 'white',
      borderRadius: wp('3%'),
      padding: wp('3%'),
      fontSize: wp('4%'),
      marginBottom: hp('1%'),
      borderWidth: 1,
      borderColor: '#ddd',
    },
    addParentInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: hp('1%'),
    },
    addParentInfoText: {
      color: '#d20505',
      fontSize: wp('3.5%'),
    },
    plusIcon: {
      color: '#d20505',
      fontSize: wp('5%'),
    },
    saveButton: {
      backgroundColor: '#4caf50',
      borderRadius: wp('3%'),
      padding: wp('3%'),
      alignItems: 'center',
      marginTop: hp('3%'),
    },
    saveButtonText: {
      color: 'white',
      fontSize: wp('4.5%'),
      fontWeight: 'bold',
    },
    studentsSection: {
      padding: wp('5%'),
      marginTop: hp('4%'),
    },
    studentsSectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp('2%'),
    },
    sectionTitle: {
      fontSize: wp('5%'),
      fontWeight: 'bold',
    },
    addStudentButton: {
      backgroundColor: '#d20505',
      borderRadius: wp('5%'),
      paddingHorizontal: wp('3%'),
      paddingVertical: hp('1%'),
    },
    addStudentButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: wp('3.5%'),
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
    studentsList: {
      marginTop: hp('1%'),
    },
    studentCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'white',
      borderRadius: wp('3%'),
      padding: wp('3%'),
      marginBottom: hp('1%'),
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
    studentAvatar: {
      width: wp('12%'),
      height: wp('12%'),
      borderRadius: wp('6%'),
    },
    studentInfo: {
      flex: 1,
      marginLeft: wp('3%'),
    },
    studentName: {
      fontSize: wp('4%'),
      fontWeight: 'bold',
    },
    studentPosition: {
      fontSize: wp('3.5%'),
      color: '#666',
    },
    editButton: {
      backgroundColor: '#d20505',
      width: wp('10%'),
      height: wp('10%'),
      borderRadius: wp('5%'),
      justifyContent: 'center',
      alignItems: 'center',
    },
    editButtonText: {
      color: 'white',
      fontSize: wp('5%'),
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
  
export { StudentsListScreen };