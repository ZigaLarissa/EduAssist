// components/ChildGradeCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function ChildGradeCard({ name, position, percentage, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.name}>{name}’s Grades</Text>
      <Text style={styles.label}>Position</Text>
      <Text style={styles.label}>Percentage</Text>
      <View style={styles.meta}>
        <Feather name="map-pin" size={16} color="#d20505" />
        <Text style={styles.metaText}>{position}</Text>
        <Feather name="trending-up" size={16} color="#d20505" style={{ marginLeft: 12 }} />
        <Text style={styles.metaText}>{percentage}%</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#d20505',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  name: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#666',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  metaText: {
    marginLeft: 4,
    color: '#d20505',
    fontWeight: '500',
  },
});
