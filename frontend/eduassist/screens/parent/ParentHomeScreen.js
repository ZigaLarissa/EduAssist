// screens/parent/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import ChildGradeCard from '../../components/ChildGradeCard';
import AnnouncementCard from '../../components/AnnouncementCard';
import BottomNav from '../../components/BottomNav';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/authContext';

const ParentHomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [userName, setUserName] = useState('');
  const [students, setStudents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = user;
        const parentEmail = currentUser.email;

        // Try getting the user's full name from Firestore
        const usersSnap = await getDocs(query(collection(db, 'users'), where('userId', '==', currentUser.uid)));  
        const userDoc = usersSnap.docs[0];
        if (userDoc) {
          setUserName(userDoc.data().username || 'Parent');
        } else {
          setUserName(currentUser.displayName || 'Parent');
        }

        // Get students linked to this parent's email
        const studentsSnap = await getDocs(
          query(collection(db, 'students'), where('parentInfo.email', '==', parentEmail))
        );
        const studentsList = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStudents(studentsList);

        // Get classIds from those students
        const studentClassIds = studentsList.map(s => s.classId);

        // Get announcements for matching classIds
        const announcementsSnap = await getDocs(collection(db, 'announcements'));
        const filteredAnnouncements = announcementsSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(ann => ann.classIds?.some(cid => studentClassIds.includes(cid)));
        setAnnouncements(filteredAnnouncements);
      } catch (error) {
        console.error('Error fetching parent home data:', error);
      }
    };

    fetchData();
  }, [user]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
        <Text style={styles.greeting}>Hi {userName},</Text>

        {students.length === 0 ? (
          <Text style={styles.summary}>No students linked to your account yet.</Text>
        ) : (
          <>
            {students.map(student => (
              <ChildGradeCard
                key={student.id}
                name={student.lastName}
                position={student.position}
                percentage={student.percentage}
                onPress={() => navigation.navigate('GradesScreen', { studentId: student.id })}
              />
            ))}

            <Text style={styles.announcementsHeader}>Announcements</Text>

            {announcements.map(ann => (
              <AnnouncementCard
                key={ann.id}
                title={ann.title}
                text={ann.text}
                startDate={ann.startDate}
                imageUrl={ann.imageUrl}
                onPress={() => navigation.navigate('AnnouncementScreen', { announcementId: ann.id })}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* Logout button */}
      <TouchableOpacity onPress={handleLogout} style={{ marginVertical: 20, alignSelf: 'center' }}>
        <Text style={{ color: '#d20505', fontWeight: '600', fontSize: 16 }}>Logout</Text>
      </TouchableOpacity>

      <BottomNav activeTab="home" role="parent" />
    </View>
  );
};

export default ParentHomeScreen;

const styles = StyleSheet.create({
  container: {
    paddingTop: 46,
    padding: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  summary: {
    fontSize: 14,
    color: '#333',
  },
  announcementsHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
});
