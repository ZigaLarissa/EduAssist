import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

const parentHome = () => {
  const [grades, setGrades] = useState([]);
  const [homeworkCount, setHomeworkCount] = useState({});
  const [announcements, setAnnouncements] = useState([]);

  const fetchGrades = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Query grades for the teacher's students
      const q = query(collection(db, "grades"), where("teacher_id", "==", user.uid));
      const querySnapshot = await getDocs(q);

      let gradesData = [];
      querySnapshot.forEach((doc) => {
        gradesData.push({ id: doc.id, ...doc.data() });
      });

      setGrades(gradesData);
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  const fetchPendingHomework = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Query assignments for the teacher's classes
      const q = query(collection(db, "assignments"), where("teacher_id", "==", user.uid));
      const querySnapshot = await getDocs(q);

      let homeworkData = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        homeworkData[data.class_id] = (homeworkData[data.class_id] || 0) + data.students_pending.length;
      });

      setHomeworkCount(homeworkData);
    } catch (error) {
      console.error("Error fetching homework:", error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const q = collection(db, "announcements");
      const querySnapshot = await getDocs(q);

      let announcementsData = [];
      querySnapshot.forEach((doc) => {
        announcementsData.push({ id: doc.id, ...doc.data() });
      });

      setAnnouncements(announcementsData);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  useEffect(() => {
    fetchGrades();
    fetchPendingHomework();
    fetchAnnouncements();
  }, []);

  return (
    <View>
      <Text>Grades</Text>
      <FlatList
        data={grades}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text>{item.student_name}: {item.percentage}%</Text>
        )}
      />

      <Text>Pending Homeworks</Text>
      <FlatList
        data={Object.keys(homeworkCount)}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Text>Class {item}: {homeworkCount[item]} pending</Text>
        )}
      />

      <Text>Announcements</Text>
      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text>{item.title} - {item.date}</Text>
        )}
      />
    </View>
  );
};

export default parentHome;
