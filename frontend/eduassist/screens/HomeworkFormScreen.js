import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Feather } from '@expo/vector-icons';
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../firebaseConfig';
import { useAuth } from '../context/authContext';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useRouter } from 'expo-router';

const HomeworkFormScreen = ({ route, navigation }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [DueDate, setDueDate] = useState('');
  const [text, setText] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingClasses, setFetchingClasses] = useState(true);
  const [fetchingSubjects, setFetchingSubjects] = useState(true);
  const [image, setImage] = useState(null);


  useEffect(() => {
      fetchClasses();
      fetchSubjects();
    }, [user]);


  // Fetch classes joined by the current teacher
    const fetchClasses = async () => {
      try {
        setFetchingClasses(true);
        if (!user || !user.uid) return;

        const classesQuery = query(
          collection(db, 'classes'),
          where('teacherIds', 'array-contains', user.uid)
        );
        
        const classesSnapshot = await getDocs(classesQuery);
        const classesList = classesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setClasses(classesList);
      } catch (error) {
        console.error('Error fetching classes: ', error);
        Alert.alert('Error', 'Failed to fetch classes. Please try again.');
      } finally {
        setFetchingClasses(false);
      }
    };

    const fetchSubjects = async () => {
        try {
          setFetchingSubjects(true);
          if (!user || !user.uid) return;
  
          const subjectsQuery = query(
            collection(db, 'subjects'),
            where('teacherId', '==', user.uid)
          );
          
          const subjectsSnapshot = await getDocs(subjectsQuery);
          const subjectsList = subjectsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setSubjects(subjectsList);
        } catch (error) {
          console.error('Error fetching subjects: ', error);
          Alert.alert('Error', 'Failed to fetch subjects. Please try again.');
        } finally {
          setFetchingSubjects(false);
        }
    };

  const toggleClass = (classId) => {
    if (selectedClasses.includes(classId)) {
      setSelectedClasses(selectedClasses.filter(id => id !== classId));
    } else {
      setSelectedClasses([...selectedClasses, classId]);
    }
  };

  const toggleSubject = (subjectId) => {
    if (selectedSubjects.includes(subjectId)) {
      setSelectedSubjects(selectedSubjects.filter(id => id !== subjectId));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    }
  };

  const toggleAllClasses = () => {
    if (selectedClasses.length === classes.length) {
      setSelectedClasses([]);
    } else {
      setSelectedClasses(classes.map(c => c.id));
    }
  };

  const toggleAllSubjects = () => {
    if (selectedSubjects.length === subjects.length) {
      setSelectedSubjects([]);
    } else {
      setSelectedSubjects(subjects.map(c => c.id));
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter homework title');
      return false;
    }
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter homework text');
      return false;
    }
    if (selectedClasses.length === 0) {
      Alert.alert('Error', 'Please select at least one class');
      return false;
    }
    if (selectedSubjects.length === 0) {
        Alert.alert('Error', 'Please select at most one subjects');
        return false;
    }
    if (!DueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('Error', 'Please enter a valid date in YYYY-MM-DD format');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      let imageUrl = null;
      
      // Upload image if available
      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();
        const storageRef = ref(storage, `announcements/${Date.now()}`);
        await uploadBytes(storageRef, blob);
        imageUrl = await getDownloadURL(storageRef);
      }
      
      // Create the announcement
      await addDoc(collection(db, 'homeworks'), {
        title: title.trim(),
        text: text.trim(),
        DueDate: DueDate,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        teacherName: user.displayName || user.email,
        classIds: selectedClasses,
        subjectIds: selectedSubjects,
        imageUrl: imageUrl,
      });
      
      Alert.alert('Success', 'Homework created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error creating homework: ', error);
      Alert.alert('Error', 'Failed to create homework. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={wp('6%')} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assing <Text style={styles.redText}>Homework</Text></Text>
        <View style={styles.placeholderRight} />
      </View>
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Homework Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter title"
          />
          
          <Text style={styles.label}>Due Date</Text>
          <TextInput
            style={styles.input}
            value={DueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD"
          />
          
          <Text style={styles.label}>Instructions</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={text}
            onChangeText={setText}
            placeholder="Enter instruction details"
            multiline
          />
          
          <View style={styles.imageSection}>
            <TouchableOpacity 
              style={styles.uploadButton} 
              onPress={pickImage}
              disabled={loading}
            >
              <Feather name="image" size={wp('5%')} color="#d20505" />
              <Text style={styles.uploadButtonText}>Upload Image</Text>
            </TouchableOpacity>
            
            {image && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setImage(null)}
                >
                  <Feather name="x" size={wp('5%')} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Text style={styles.label}>Select Recipients</Text>
          {fetchingClasses ? (
            <ActivityIndicator size="small" color="#d20505" style={styles.loader} />
          ) : classes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No classes available. Please create a class first.
              </Text>
              <TouchableOpacity 
                style={styles.createClassButton}
                onPress={() => router.push('ClassesScreen')}
              >
                <Text style={styles.createClassButtonText}>Create Class</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkboxItem}
                onPress={toggleAllClasses}
              >
                <View style={styles.checkbox}>
                  {selectedClasses.length === classes.length && classes.length > 0 && (
                    <Feather name="check" size={wp('4%')} color="#fff" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>All Parents</Text>
              </TouchableOpacity>
              
              {classes.map((classItem) => (
                <TouchableOpacity
                  key={classItem.id}
                  style={styles.checkboxItem}
                  onPress={() => toggleClass(classItem.id)}
                >
                  <View style={[
                    styles.checkbox,
                    selectedClasses.includes(classItem.id) && styles.checkboxSelected
                  ]}>
                    {selectedClasses.includes(classItem.id) && (
                      <Feather name="check" size={wp('2%')} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>{classItem.name} Parents</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Select Subject</Text>
          {fetchingSubjects ? (
            <ActivityIndicator size="small" color="#d20505" style={styles.loader} />
          ) : subjects.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No subjects available. Please create a subject first.
              </Text>
              <TouchableOpacity 
                style={styles.createClassButton}
                onPress={() => router.push('ClassScreen')}
              >
                <Text style={styles.createClassButtonText}>Create Subject</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.checkboxContainer}>
              {/* <TouchableOpacity
                style={styles.checkboxItem}
                onPress={toggleAllSubjects}
              >
                <View style={styles.checkbox}>
                  {selectedSubjects.length === subjects.length && subjects.length > 0 && (
                    <Feather name="check" size={wp('4%')} color="#fff" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>All Subjects</Text>
              </TouchableOpacity> */}
              
              {subjects.map((subjectItem) => (
                <TouchableOpacity
                  key={subjectItem.id}
                  style={styles.checkboxItem}
                  onPress={() => toggleSubject(subjectItem.id)}
                >
                  <View style={[
                    styles.checkbox,
                    selectedSubjects.includes(subjectItem.id) && styles.checkboxSelected
                  ]}>
                    {selectedSubjects.includes(subjectItem.id) && (
                      <Feather name="check" size={wp('2%')} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>{subjectItem.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          
          <TouchableOpacity
            style={[styles.sendButton, (loading) && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>Assign Homework</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    color: '#d20505',
  },
  placeholderRight: {
    width: wp('10%'),
  },
  container: {
    flex: 1,
  },
  formContainer: {
    padding: wp('5%'),
  },
  label: {
    fontSize: wp('4%'),
    fontWeight: '500',
    marginBottom: hp('1%'),
    marginTop: hp('2%'),
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    padding: wp('3%'),
    fontSize: wp('4%'),
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: hp('15%'),
    textAlignVertical: 'top',
  },
  uploadButton: {
    borderRadius: wp('3%'),
    padding: wp('4%'),
    padding: hp('6%'),
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d20505',
  },
  checkboxContainer: {
    marginTop: hp('1%'),
    marginRight: wp('1%'),
    flexDirection: 'row',
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
    marginRight: wp('2%')
  },
  checkbox: {
    width: wp('4%'),
    height: wp('4%'),
    borderRadius: wp('1.5%'),
    borderWidth: 2,
    borderColor: '#d20505',
    marginRight: wp('1%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#d20505',
  },
  checkboxLabel: {
    fontSize: wp('3%'),
  },
  uploadButtonText: {
    color: '#d20505',
    marginLeft: wp('2%'),
    fontSize: wp('4%'),
  },
  imagePreviewContainer: {
    marginTop: hp('2%'),
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: hp('20%'),
    borderRadius: wp('3%'),
  },
  removeImageButton: {
    position: 'absolute',
    top: hp('1%'),
    right: wp('1%'),
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: wp('5%'),
    padding: wp('1%'),
  },
  sendButton: {
    backgroundColor: '#4caf50',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    alignItems: 'center',
    marginTop: hp('4%'),
    marginBottom: hp('2%'),
  },
  sendButtonText: {
    color: '#fff',
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  loader: {
    marginVertical: hp('2%'),
  },
  imageSection: {
    marginTop: hp('2%'),
  },
  emptyState: {
    padding: wp('5%'),
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    marginTop: hp('1%'),
  },
  emptyStateText: {
    fontSize: wp('4%'),
    color: '#666',
    textAlign: 'center',
    marginBottom: hp('2%'),
  },
  createClassButton: {
    backgroundColor: '#d20505',
    borderRadius: wp('3%'),
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('5%'),
  },
  createClassButtonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontWeight: '500',
  },
});

export { HomeworkFormScreen };