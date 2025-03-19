import { View, Text, ActivityIndicator } from 'react-native'
import React from 'react'
// import LottieView from 'lottie-react-native';


export default function Loading({size}) {
  return (
    <View className='flex-1 justify-center items-center'>
      <ActivityIndicator size={size} color='#d20505' />
    </View>
  );
}