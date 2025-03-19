import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Feather, Octicons } from '@expo/vector-icons';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/authContext';
import { useRouter } from 'expo-router';

const HomeScreen = ({ route,navigation }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  useEffect(() => {
    fetchClasses();
    fetchAnnouncements();
  }, [user]);



  const fetchClasses = async () => {
        try {
          setLoadingClasses(true);
          if (!user || !user.uid) return;
  
          // Get joined classes (classes where the user is in teacherIds)
          const joinedClassesQuery = query(
            collection(db, 'classes'),
            where('teacherIds', 'array-contains', user.uid)
          );
          
          const ClassesSnapshot = await getDocs(joinedClassesQuery);
          const ClassesList = ClassesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setClasses(ClassesList);
          
        } catch (error) {
          console.error('Error fetching classes: ', error);
          Alert.alert('Error', 'Failed to load classes');
        } finally {
          setLoadingClasses(false);
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

const renderClassItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.classCard}
      onPress={() => navigation.navigate("ClassScreen", { classId: item.id, className: item.name })}
    >
      {/* <Image 
        source={require('../assets/images/class-avatar.png')} 
        style={styles.classAvatar}
        defaultSource={require('../assets/images/class-avatar.png')}
      /> */}
      <View style={styles.classIconContainer}>
        <Feather name="users" size={24} color="#d20505" />
      </View>
      <View style={styles.classInfo}>
        <Text style={styles.className}>{item.name}</Text>
        <Text style={styles.classDescription}>{item.description || 'You are a teacher in this class.'}</Text>
      </View>
      <Text style={styles.arrowRight}>›</Text>
    </TouchableOpacity>
  );

  const formatDate = (date) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {/* App Name & Icon */}
        <View style={styles.headerCenter}>
          <Image source={require("../assets/images/icon.png")} style={styles.logo} />
          <Text style={styles.appName}>EduAssist</Text>
        </View>

        {/* <TouchableOpacity>
          <Feather name="menu" size={wp('6%')} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="bell" size={wp('6%')} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Feather name="user" size={wp('5%')} color="#fff" />
            </View>
          </TouchableOpacity>
        </View> */}
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pick a Class</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('ClassesScreen')}
            >
              <Feather name="plus" size={wp('5%')} color="#d20505" />
            </TouchableOpacity>
          </View>

          {loadingClasses ? (
            <ActivityIndicator size="large" color="#d20505" style={styles.loader} />
          ) : classes.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                No classes available. Click the + button to create a new class.
              </Text>
            </View>
          ) : (
            <FlatList
              data={classes}
              renderItem={renderClassItem}
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
            <Text style={styles.sectionTitle}>Announcements</Text>
            <TouchableOpacity 
              style={styles.addButton}
            //   onPress={() => router.push('AnnouncementFormScreen')}
              onPress={() => navigation.navigate('AnnouncementFormScreen')}
            >
              <Feather name="plus" size={wp('5%')} color="#d20505" />
            </TouchableOpacity>
          </View>
          
          {loadingAnnouncements ? (
            <ActivityIndicator size="large" color="#d20505" style={styles.loader} />
          ) : announcements.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                No announcements yet. Click the + button to create a new announcement.
              </Text>
            </View>
          ) : (
            announcements.map(announcement => (
              <View key={announcement.id} style={styles.announcementCard}>
                {announcement.imageUrl && (
                  <Image 
                    source={{ uri: announcement.imageUrl }} 
                    style={styles.announcementImage}
                  />
                )}
                <View style={styles.announcementContent}>
                  <Text style={styles.announcementTitle}>{announcement.title}</Text>
                  <Text style={styles.announcementText}>
                    {announcement.text.length > 100 
                      ? announcement.text.substring(0, 100) + '...' 
                      : announcement.text}
                  </Text>
                  <Text style={styles.announcementDate}>
                    {formatDate(announcement.createdAt)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tabItem, styles.activeTab]}>
            <Octicons name="home" size={24} color="#d20505" />
            <Text style={[styles.tabLabel, styles.activeTabLabel]}>Home</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp('5%'),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: wp("7%"),
    height: wp("7%"),
    marginRight: wp("2%"),
  },
  appName: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    color: "#000",
  },
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
  },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    padding: wp('3%'),
    marginBottom: hp('1.5%'),
    // elevation: 2,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.2,
    // shadowRadius: 2,
  },
  classAvatar: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    marginRight: wp('3%'),
  },
  classIconContainer: {
  backgroundColor: '#fff9f9',
  padding: wp('3%'),
  borderRadius: wp('8%'),
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    paddingLeft: wp('3%'),
  },
  classDescription: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginTop: hp('0.5%'),
    paddingLeft: wp('3%'),
  },
  arrowRight: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: '#666',
  },
  announcementCard: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    marginBottom: hp('2%'),
    // overflow: 'hidden',
    // elevation: 2,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.2,
    // shadowRadius: 2,
  },
  announcementImage: {
    width: '100%',
    height: hp('20%'),
    borderRadius: wp('3%'),
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
  classesList: {
    paddingBottom: hp('1%'),
  },
});

export { HomeScreen };