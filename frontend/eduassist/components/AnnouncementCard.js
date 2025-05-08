// components/AnnouncementCard.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function AnnouncementCard({ title, text, imageUrl, startDate, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{text}</Text>
        <Text style={styles.date}>{startDate}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 10,
  },
  title: {
    fontWeight: '600',
    fontSize: 14,
  },
  desc: {
    fontSize: 12,
    color: '#333',
  },
  date: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 4,
  },
});
