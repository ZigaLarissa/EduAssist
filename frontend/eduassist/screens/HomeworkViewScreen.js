import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { db } from '../firebaseConfig';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Feather } from '@expo/vector-icons';
import { Linking } from 'react-native';


const HomeworkViewScreen = ({ route, navigation }) => {
  // Get assignment ID from route params
  const { assignmentId } = route.params || {};
  
  // State variables
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [recommendedResource, setRecommendedResource] = useState(null);


  // Fetch assignment data from Firebase
  useEffect(() => {
    const fetchAssignment = async () => {
        try {
            if (!assignmentId) {
              console.error('No assignment ID provided');
              setLoading(false);
              return;
            }
        
            // Create a reference to the specific document using the assignmentId
            const assignmentRef = doc(db, 'homeworks', assignmentId);
            
            // Get the document
            const assignmentSnapshot = await getDoc(assignmentRef);
            
            if (assignmentSnapshot.exists()) {
              const data = assignmentSnapshot.data();
              console.log('Due date value:', data.DueDate);
              setAssignment({
                id: assignmentSnapshot.id,
                ...data,
                createdAt: data.createdAt ? data.createdAt.toDate().toLocaleString() : '',
                DueDate: data.DueDate ? data.DueDate : '', // Add this line
              });
            } else {
              console.log('Assignment document does not exist');
              Alert.alert('Error', 'Homework not found');
            }
          } catch (error) {
            console.error('Error fetching assignment:', error);
            Alert.alert('Error', 'Failed to load homework details');
          } finally {
            setLoading(false);
          }        
    };

    fetchAssignment();
  }, [assignmentId]);

  // Mark assignment as done or undone
  const toggleAssignmentStatus = async () => {
    try {
      if (!assignmentId) return;
      
      const newStatus = !(assignment?.completed || false);
      
      // Update using Firebase v9 syntax
      const assignmentRef = doc(db, 'homeworks', assignmentId);
      await updateDoc(assignmentRef, {
        completed: newStatus,
      });
      
      setAssignment(prev => prev ? {
        ...prev,
        completed: newStatus
      } : null);
      
      Alert.alert(
        newStatus ? 'Marked as Done' : 'Marked as Incomplete',
        newStatus ? 'Great job completing this homework!' : 'You can mark it as done when you complete it.'
      );
    } catch (error) {
      console.error('Error updating homework status:', error);
      Alert.alert('Error', 'Failed to update homework status');
    }
  };

  // Open external resource based on model recommendation
  const openResource = async () => {
    try {
      // Show loading state
      setResourceLoading(true);

      // Get the first classId from the assignment (if available)
      const classId = assignment.classIds && assignment.classIds.length > 0 
      ? assignment.classIds[0] // Use the first class ID
      : null;

      // If we have a classId, fetch the class details to get the grade level
      if (classId) {
        try {
          const classRef = doc(db, 'classes', classId);
          const classSnapshot = await getDoc(classRef);
          
          if (classSnapshot.exists()) {
            const classData = classSnapshot.data();
            // Use the name field from the class document as the grade level
            gradeLevelName = classData.name;
          }
        } catch (classError) {
          console.error('Error fetching class info:', classError);
          // Continue with default grade level if there's an error
        }
      }
        
      // Prepare the data to send to your model
      const assignmentData = {
        description: assignment.text,
        grade_level: gradeLevelName,
      };
      
      // The Docker container endpoint
      // const modelEndpoint = 'http://10.10.11.91:8000/recommend';
      // const modelEndpoint = 'http://192.168.1.66:8000/recommend';
      const modelEndpoint = 'http://172.17.27.69:8000/recommend';

      
      // Make API call to your Docker-hosted model
      const response = await fetch(modelEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get resource recommendation: ${response.status}');
      }
      
      // Parse the response
      const recommendation = await response.json();
      console.log("Received recommendation:", recommendation);
      
      // Handle the recommendation - could be a URL or other resource information
      if (recommendation.resource_url) {
        // Open the URL using Linking from react-native
        // Linking.openURL(recommendation.resource_url);
        setRecommendedResource(recommendation.resource_url); 

        // Optionally show additional info about the resource
        Alert.alert(
          'Resource Found',
          `Opening resource for ${recommendation.subject || 'this assignment'} (Grade: ${recommendation.grade_level || gradeLevelName})`,
          [{ text: 'OK' }]
        );
      } else {
        // Display the recommendation information
        Alert.alert(
          'No Resource Available',
          'No suitable resource was found for this assignment.'
        );
      }
    } catch (error) {
      console.error('Error getting resource recommendation:', error);
      Alert.alert('Error', 'Failed to get resource recommendations. Please try again later.');
    } finally {
      setResourceLoading(false);
    }
  };

  // Format the due date
  const formatDueDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      // Handle ISO string format from Firestore
      if (dateString.includes('-')) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      }
      // If it's an ISO string or other string format
      else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      }
      return dateString;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Go back to previous screen
  const goBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#d20505" />
      </SafeAreaView>
    );
  }

  if (!assignment) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Icon name="alert-circle" size={wp('15%')} color="#d20505" />
        <Text style={styles.errorText}>Homework not found</Text>
        <TouchableOpacity style={styles.backButtonLarge} onPress={goBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={wp('6%')} color="#000" />
          </TouchableOpacity>
      </View> */}

      <ScrollView contentContainerStyle={styles.scrollContainer}>

        {/* Assignment title and due date */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{assignment.title || 'Homework'}</Text>
          {assignment.DueDate && (
            <Text style={styles.DueDate}>Due: {formatDueDate(assignment.DueDate)}</Text>
          )}
        </View>

        {/* Assignment instructions/text */}
        {assignment.text && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionText}>{assignment.text}</Text>
          </View>
        )}

        {/* Teacher name if available */}
        {assignment.teacherName && (
          <View style={styles.teacherContainer}>
            <Text style={styles.teacherText}>Teacher: {assignment.teacherName}</Text>
          </View>
        )}

        {/* Assignment image */}
        {assignment.imageUrl && (
          <>
            <View style={styles.imageHeaderContainer}>
              <Text style={styles.imageHeaderText}>Attached Image:</Text>
            </View>
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: assignment.imageUrl }} 
                style={styles.assignmentImage} 
                resizeMode="contain"
              />
            </View>
          </>
        )}

        {/* Action buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.openResourceButton}
            onPress={openResource}
            disabled={resourceLoading}
          >
            {resourceLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="link" size={wp('5%')} color="#fff" />
                <Text style={styles.buttonText}>Open Resource</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Display Recommended Resource Link */}
          {recommendedResource && (
            <View style={styles.linkContainer}>
              <Text style={styles.resourceText}>Recommended Resource:</Text>
              <TouchableOpacity onPress={() => Linking.openURL(recommendedResource)}>
                <Text style={styles.resourceLink}>{recommendedResource}</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.markAsDoneButton}
            onPress={toggleAssignmentStatus}
          >
            <View style={styles.checkboxContainer}>
              {assignment.completed ? (
                <MaterialIcons name="check-box" size={wp('5%')} color="#d20505" />
              ) : (
                <MaterialIcons name="check-box-outline-blank" size={wp('5%')} color="#d20505" />
              )}
            </View>
            <Text style={styles.markAsDoneText}>Mark As Done</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: hp('4%'),
  },
  header: {
    flexDirection: 'column',
    paddingHorizontal: wp('5%'),
    paddingTop: hp('4%'),
    paddingBottom: hp('2%'),
    backgroundColor: '#fff',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  backButton: {
    paddingTop: wp('6%'),
  },
  scrollContainer: {
    // flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('5%'),
  },
  loadingText: {
    marginTop: hp('2%'),
    fontSize: wp('4%'),
    color: '#666',
  },
  errorText: {
    marginTop: hp('2%'),
    fontSize: wp('4.5%'),
    color: '#666',
    marginBottom: hp('3%'),
  },
  iconButton: {
    padding: wp('2%'),
    marginLeft: wp('2%'),
  },
  titleContainer: {
    padding: wp('4%'),
    backgroundColor: '#fff',
    // borderBottomWidth: 1,
    // borderBottomColor: '#eee',
  },
  title: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: '#000',
  },
  DueDate: {
    fontSize: wp('3.5%'),
    color: '#d20505',
    marginTop: hp('0.5%'),
  },
  instructionsContainer: {
    padding: wp('4%'),
    backgroundColor: '#fff',
    // borderBottomWidth: 1,
    // borderBottomColor: '#eee',
  },
  instructionText: {
    fontSize: wp('3.8%'),
    color: '#333',
    lineHeight: hp('2.5%'),
  },
  teacherContainer: {
    padding: wp('4%'),
    backgroundColor: '#fff',
    // borderBottomWidth: 1,
    // borderBottomColor: '#eee',
  },
  teacherText: {
    fontSize: wp('3.5%'),
    color: '#666',
    fontStyle: 'italic',
  },
  imageHeaderContainer: {
    padding: wp('4%'),
    paddingBottom: wp('2%'),
    backgroundColor: '#fff',
  },
  imageHeaderText: {
    fontSize: wp('3.8%'),
    fontWeight: '500',
    color: '#333',
  },
  imageContainer: {
    width: wp('100%'),
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: hp('2%'),
    // borderBottomWidth: 1,
    // borderBottomColor: '#eee',
  },
  assignmentImage: {
    width: wp('90%'),
    height: hp('35%'),
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('1%'),
  },
  actionButtonsContainer: {
    padding: wp('4%'),
    backgroundColor: '#fff',
    // marginTop: hp('1%'),
  },
  openResourceButton: {
    backgroundColor: '#d20505',
    borderRadius: wp('1%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('1.5%'),
    marginBottom: hp('2%'),
  },
  buttonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontWeight: '600',
    marginLeft: wp('2%'),
  },
  linkContainer: {
    marginTop: hp('2%'),
    padding: wp('4%'),
    backgroundColor: '#fff',
    borderRadius: wp('2%'),
    alignItems: 'center',
  },
  resourceText: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#333',
  },
  resourceLink: {
    fontSize: wp('3.8%'),
    color: '#1E88E5',
    textDecorationLine: 'underline',
    marginTop: hp('1%'),
  },  
  markAsDoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('1%'),
    paddingVertical: hp('1.5%'),
  },
  checkboxContainer: {
    marginRight: wp('2%'),
  },
  markAsDoneText: {
    color: '#333',
    fontSize: wp('4%'),
    fontWeight: '600',
  },
});

export { HomeworkViewScreen };