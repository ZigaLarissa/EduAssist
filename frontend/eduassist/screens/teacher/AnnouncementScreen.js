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
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/authContext';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { Ionicons, Feather } from '@expo/vector-icons';

const AnnouncementScreen = ({ route, navigation }) => {
  // Get announcement ID from route params
  const { announcementId } = route.params || {};
  
  // State variables
  const { user } = useAuth();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  
  // Fetch announcement data from Firebase
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        setLoading(true);
        if (!announcementId) {
          setLoading(false);
          return;
        }
        
        // Fetch the specific announcement using announcementId
        const announcementRef = doc(db, 'announcements', announcementId);
        const announcementSnap = await getDoc(announcementRef);
        
        if (announcementSnap.exists()) {
          const announcementData = {
            id: announcementSnap.id,
            ...announcementSnap.data(),
            createdAt: announcementSnap.data().createdAt?.toDate?.() || new Date()
          };
          setAnnouncement(announcementData);
        } else {
          // Announcement not found
          setAnnouncement(null);
        }
      } catch (error) {
        console.error('Error fetching announcement: ', error);
        setAnnouncement(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchAnnouncements = async () => {
      try {
        setLoadingAnnouncements(true);
        if (!user || !user.uid) return;
  
        // Get classes first to know which announcements to fetch
        const classesQuery = query(
          collection(db, 'classes'),
          where('teacherIds', 'array-contains', user.uid)
        );
        
        const classesSnapshot = await getDocs(classesQuery);
        const classIds = classesSnapshot.docs.map(doc => doc.id);
        
        if (classIds.length === 0) {
          setLoadingAnnouncements(false);
          return;
        }
  
        // Get announcements for these classes
        const announcementsQuery = query(
          collection(db, 'announcements'),
          where('classIds', 'array-contains-any', classIds),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        
        const announcementsSnapshot = await getDocs(announcementsQuery);
        const announcementsList = announcementsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));
        
        setAnnouncements(announcementsList);
      } catch (error) {
        console.error('Error fetching announcements: ', error);
      } finally {
        setLoadingAnnouncements(false);
      }
    };
    
    fetchAnnouncement();
    fetchAnnouncements();
  }, [announcementId, user]);

  // Format the due date
  const formatDate = (dateString) => {
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

  if (!announcement) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle" size={wp('15%')} color="#d20505" />
        <Text style={styles.errorText}>Announcement not found</Text>
        <TouchableOpacity style={styles.backButtonLarge} onPress={goBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={wp('6%')} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Announcement <Text style={styles.redText}>Details</Text></Text>
        <View style={styles.placeholderRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Announcement title and due date */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{announcement.title || 'Announcement'}</Text>
          {announcement.startDate && (
            <Text style={styles.DueDate}>Date: {formatDate(announcement.startDate)}</Text>
          )}
        </View>

        {/* Announcement image */}
        {announcement.imageUrl && (
          <>
            <View style={styles.imageHeaderContainer}>
              <Text style={styles.imageHeaderText}>Attached Image:</Text>
            </View>
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: announcement.imageUrl }} 
                style={styles.assignmentImage} 
                resizeMode="contain"
              />
            </View>
          </>
        )}

        {/* announcement instructions/text */}
        {announcement.text && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionText}>{announcement.text}</Text>
          </View>
        )}

        {/* Teacher name if available */}
        {announcement.teacherName && (
          <View style={styles.teacherContainer}>
            <Text style={styles.teacherText}>Teacher: {announcement.teacherName}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: hp('4%'),
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    // backgroundColor: '#fff',
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
    color: '#d20505',
  },
  placeholderRight: {
    width: wp('10%'),
  },
  backButtonLarge: {
    backgroundColor: '#d20505',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('8%'),
    borderRadius: wp('1%'),
  },
  backButtonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontWeight: '600',
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
  },
  instructionText: {
    fontSize: wp('3.8%'),
    color: '#333',
    lineHeight: hp('2.5%'),
  },
  teacherContainer: {
    padding: wp('4%'),
  },
  teacherText: {
    fontSize: wp('3.5%'),
    color: '#666',
    fontStyle: 'italic',
  },
  imageHeaderContainer: {
    padding: wp('4%'),
    paddingBottom: wp('2%'),
  },
  imageHeaderText: {
    fontSize: wp('3.8%'),
    fontWeight: '500',
    color: '#333',
  },
  imageContainer: {
    width: wp('100%'),
    alignItems: 'center',
    paddingVertical: hp('2%'),
    // borderBottomWidth: 1,
    // borderBottomColor: '#eee',
  },
  assignmentImage: {
    width: wp('90%'),
    height: hp('25%'),
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('1%'),
  },
});

export { AnnouncementScreen };