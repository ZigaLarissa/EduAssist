import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  StyleSheet,
  Alert,
  SafeAreaView
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Octicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/authContext';
import { ClassSelector } from '../components/ClassSelector';


// Student Form Screen - Used for both Add and Edit functionality
const StudentsFormScreen = ({ route, navigation }) => {
    // Access the authenticated user
    const { user } = useAuth();


    // Check if we're editing an existing student or adding a new one
    const editMode = route.params?.student ? true : false;
    const studentData = route.params?.student;
    // const classId = route.params?.classId || '';
    // const className = route.params?.className || 'Primary 1';
    
    // class fields
    const classIdFromParams = route.params?.classId;
    const classNameFromParams = route.params?.className;

    // State for form fields
    const [surname, setSurname] = useState(editMode ? studentData.surname : '');
    const [lastName, setLastName] = useState(editMode ? studentData.lastName : '');
    const [position, setPosition] = useState(editMode ? studentData.position : '');
    const [percentage, setPercentage] = useState(editMode ? studentData.percentage : '');
    const [parentSurname, setParentSurname] = useState(editMode ? studentData.parentInfo?.surname : '');
    const [parentLastName, setParentLastName] = useState(editMode ? studentData.parentInfo?.lastName : '');
    const [parentEmail, setParentEmail] = useState(editMode ? studentData.parentInfo?.email : '');
    const [selectedClass, setSelectedClass] = useState(classIdFromParams && classNameFromParams ?
      { id: classIdFromParams, name: classNameFromParams } : null);
  
    
    // Handle class selection
    const handleSelectClass = (classItem) => {
      setSelectedClass(classItem);
    };
    
    
    // Handle form submission
    const handleSubmit = async () => {

      // Basic validation
      if (!surname.trim() || !lastName.trim() || !position.trim()) {
        Alert.alert('Required Fields', 'Please fill in all required fields');
        return;
      }

      if (!selectedClass) {
        Alert.alert('Select Class', 'Please select a class for the student');
        return;
      }

      try {
        const studentObj = {
          surname,
          lastName,
          position,
          percentage: percentage || '0',
          parentInfo: {
            surname: parentSurname || '',
            lastName: parentLastName || '',
            email: parentEmail || ''
          },
          classId: selectedClass.id,
          teacherId: user.uid,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        if (editMode && studentData.id) {
          // Update existing student
          const studentRef = doc(db, 'students', studentData.id);
          await updateDoc(studentRef, {
            ...studentObj,
            updatedAt: new Date()
          });
          Alert.alert('Success', 'Student updated successfully');
        } else {
          // Add new student
          await addDoc(collection(db, 'students'), studentObj);
          Alert.alert('Success', 'Student added successfully');
        }
        
        // Navigate back to the students list
        navigation.goBack();
      } catch (error) {
        console.error('Error saving student: ', error);
        Alert.alert('Error', 'There was an error saving the student');
      }
    };
    
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Feather name="arrow-left" size={wp('6%')} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add <Text style={styles.redText}>A New Student</Text></Text>
          <View style={styles.placeholderRight} />
          </View>
          
          {/* <TouchableOpacity style={styles.classButton}>
            <Text style={styles.classButtonText}>Class</Text>
            <Text style={styles.classButtonText}>{className}</Text>
            <Text style={styles.arrowRight}>›</Text>
          </TouchableOpacity> */}
          
          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Class Button */}
            <ClassSelector
              selectedClass={selectedClass}
              onSelectClass={handleSelectClass}
              navigation={navigation}
            />


            <Text style={styles.label}>Surname</Text>
            <TextInput
              style={styles.input}
              value={surname}
              onChangeText={setSurname}
              placeholder="Enter surname"
            />
            
            <Text style={styles.label}>Last Name(s)</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
            />
            
            <Text style={styles.label}>Position</Text>
            <TextInput
              style={styles.input}
              value={position}
              onChangeText={setPosition}
              placeholder="Enter position (e.g. 1/25)"
              keyboardType="numeric"
            />
            
            <Text style={styles.label}>Percentage</Text>
            <TextInput
              style={styles.input}
              value={percentage}
              onChangeText={setPercentage}
              placeholder="Enter percentage"
              keyboardType="numeric"
            />
            
            <Text style={styles.label}>Parent(s) Info</Text>
            <View style={styles.parentInfoContainer}>
              <TextInput
                style={styles.parentInput}
                value={parentSurname}
                onChangeText={setParentSurname}
                placeholder="Surname"
              />
              
              <TextInput
                style={styles.parentInput}
                value={parentLastName}
                onChangeText={setParentLastName}
                placeholder="Last Name(s)"
              />
              
              <TextInput
                style={styles.parentInput}
                value={parentEmail}
                onChangeText={setParentEmail}
                placeholder="Email"
                keyboardType="email-address"
              />
              
              <TouchableOpacity style={styles.addParentInfo}>
                <Text style={styles.addParentInfoText}>Add more parent/guardian info</Text>
                <Text style={styles.plusIcon}>⊕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
              <Text style={styles.saveButtonText}>{editMode ? 'Update Student' : 'Add Student'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
        {/* Bottom Navigation */}
        <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tabItem}>
                    <Octicons name="home" size={24} color="#666" />
                    <Text style={styles.tabLabel}>Home</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.tabItem}>
                    <Feather name="folder" size={24} color="#666" />
                    <Text style={styles.tabLabel}>Resources</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.tabItem}>
                    <Octicons name="comment-discussion" size={24} color="#666" />
                    <Text style={styles.tabLabel}>Chats</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.tabItem, styles.activeTab]}
                    onPress={() => navigation.navigate('StudentsListScreen')}
                    >
                    <Octicons name="gear" size={24} color="#e74c3c" />
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
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: wp('5%'),
      paddingTop: hp('5%'),
      paddingBottom: hp('2%'),
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
    classButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#e74c3c',
      borderRadius: wp('5%'),
      paddingHorizontal: wp('5%'),
      paddingVertical: hp('2%'),
      marginHorizontal: wp('5%'),
      marginTop: hp('1%'),
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
      color: '#e74c3c',
      fontSize: wp('3.5%'),
    },
    plusIcon: {
      color: '#e74c3c',
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
      backgroundColor: '#e74c3c',
      borderRadius: wp('5%'),
      paddingHorizontal: wp('3%'),
      paddingVertical: hp('1%'),
    },
    addStudentButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: wp('3.5%'),
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
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
      backgroundColor: '#e74c3c',
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
  
export { StudentsFormScreen };