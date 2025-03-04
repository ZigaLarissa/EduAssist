import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from "../firebaseConfig";
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/authContext';


const ClassSelector = ({ selectedClass, onSelectClass, navigation }) => {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch classes joined by the current teacher
  useEffect(() => {
    const fetchClasses = async () => {
      if (!modalVisible) return; // Only fetch when modal is opened
      
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    
    fetchClasses();
  }, [modalVisible, user]);

  const handleSelectClass = (classItem) => {
    onSelectClass(classItem);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Class</Text>
      
      <TouchableOpacity 
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectorText}>
          {selectedClass ? selectedClass.name : 'Select Class'}
        </Text>
        <Feather name="chevron-down" size={wp('5%')} color="#666" />
      </TouchableOpacity>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Class</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Feather name="x" size={wp('6%')} color="#666" />
              </TouchableOpacity>
            </View>
            
            {loading ? (
              <ActivityIndicator size="large" color="#e74c3c" style={styles.loader} />
            ) : (
              classes.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No classes available. Please create or join a class first.
                  </Text>
                  <TouchableOpacity 
                    style={styles.selectorButton} 
                    onPress={() => {
                      if (navigation) {
                        navigation.navigate('ClassesScreen');
                      } else {
                        console.warn('Navigation is not available');
                      }
                    }}
                  >
                    <Text style={styles.selectorText}>Create/Join Class</Text>
                    <Feather name="chevron-right" size={wp('5%')} color="#666" />
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={classes}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.classItem}
                      onPress={() => handleSelectClass(item)}
                    >
                      <View style={styles.classIconContainer}>
                        <Feather name="users" size={wp('5%')} color="#e74c3c" />
                      </View>
                      <View style={styles.classInfo}>
                        <Text style={styles.className}>{item.name}</Text>
                      </View>
                      {selectedClass && selectedClass.id === item.id && (
                        <Feather name="check" size={wp('5%')} color="#4caf50" />
                      )}
                    </TouchableOpacity>
                  )}
                  style={styles.classList}
                />
              )
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: hp('2%'),
  },
  label: {
    fontSize: wp('4%'),
    marginBottom: hp('0.5%'),
    color: '#333',
  },
  selectorButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: wp('3%'),
    padding: wp('3%'),
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectorText: {
    fontSize: wp('4%'),
    color: '#333',
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
    width: wp('90%'),
    maxHeight: hp('70%'),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
  },
  closeButton: {
    padding: wp('1%'),
  },
  classList: {
    maxHeight: hp('50%'),
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  classIconContainer: {
    backgroundColor: '#fff9f9',
    padding: wp('2%'),
    borderRadius: wp('4%'),
    marginRight: wp('3%'),
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: wp('4%'),
    fontWeight: '500',
  },
  loader: {
    padding: wp('10%'),
  },
  emptyState: {
    padding: wp('10%'),
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: wp('4%'),
    color: '#666',
    textAlign: 'center',
  },
});

export { ClassSelector };