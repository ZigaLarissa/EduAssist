// firestoreService.js
import { 
    collection, 
    addDoc, 
    updateDoc, 
    doc, 
    getDocs, 
    getDoc, 
    query, 
    where, 
    orderBy,
    deleteDoc,
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from '../firebaseConfig';
  
  // Student Management
  export const addStudent = async (studentData) => {
    try {
      const studentWithTimestamp = {
        ...studentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'students'), studentWithTimestamp);
      return { id: docRef.id, ...studentWithTimestamp };
    } catch (error) {
      console.error('Error adding student: ', error);
      throw error;
    }
  };
  
  export const updateStudent = async (studentId, studentData) => {
    try {
      const studentRef = doc(db, 'students', studentId);
      const updatedData = {
        ...studentData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(studentRef, updatedData);
      return { id: studentId, ...updatedData };
    } catch (error) {
      console.error('Error updating student: ', error);
      throw error;
    }
  };
  
  export const deleteStudent = async (studentId) => {
    try {
      await deleteDoc(doc(db, 'students', studentId));
      return studentId;
    } catch (error) {
      console.error('Error deleting student: ', error);
      throw error;
    }
  };
  
  export const getStudentsByClass = async (classId) => {
    try {
      const studentsQuery = query(
        collection(db, 'students'),
        where('classId', '==', classId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(studentsQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting students: ', error);
      throw error;
    }
  };
  
  // Class Management
  export const addClass = async (classData) => {
    try {
      const classWithTimestamp = {
        ...classData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'classes'), classWithTimestamp);
      return { id: docRef.id, ...classWithTimestamp };
    } catch (error) {
      console.error('Error adding class: ', error);
      throw error;
    }
  };
  
  export const getClasses = async (teacherId) => {
    try {
      const classesQuery = query(
        collection(db, 'classes'),
        where('teacherId', '==', teacherId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(classesQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting classes: ', error);
      throw error;
    }
  };
  
  // Assignments Management
  export const addAssignment = async (assignmentData) => {
    try {
      const assignmentWithTimestamp = {
        ...assignmentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'assignments'), assignmentWithTimestamp);
      return { id: docRef.id, ...assignmentWithTimestamp };
    } catch (error) {
      console.error('Error adding assignment: ', error);
      throw error;
    }
  };
  
  export const getAssignmentsByClass = async (classId) => {
    try {
      const assignmentsQuery = query(
        collection(db, 'assignments'),
        where('classId', '==', classId),
        orderBy('dueDate', 'asc')
      );
      
      const querySnapshot = await getDocs(assignmentsQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting assignments: ', error);
      throw error;
    }
  };
  
  // Announcements Management
  export const addAnnouncement = async (announcementData) => {
    try {
      const announcementWithTimestamp = {
        ...announcementData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'announcements'), announcementWithTimestamp);
      return { id: docRef.id, ...announcementWithTimestamp };
    } catch (error) {
      console.error('Error adding announcement: ', error);
      throw error;
    }
  };
  
  export const getAnnouncementsByClass = async (classId) => {
    try {
      const announcementsQuery = query(
        collection(db, 'announcements'),
        where('classId', '==', classId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(announcementsQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting announcements: ', error);
      throw error;
    }
  };