import { View, Text, TextInput, Pressable, TouchableOpacity, Alert } from 'react-native'
import React, { useRef, useState} from 'react'
import { StatusBar } from 'expo-status-bar';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Loading from '../components/loading';


export default function signIn() {
  const router = useRouter();
  // const [loading, setLoading] = useState(false);

  const emailRef = useRef("");
  const passwordRef = useRef("");

  const handleLogin = () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert('Sign In', 'Please fill in all fields!');
      return;
    }

    // login process
  }

  return (
    <View className='flex-1'>
      <StatusBar style='dark' />
      <View style={{paddingTop: hp(30), paddingHorizontal: wp(5)}} className='flex-1 gap-12'>
        <Text style={{fontSize: hp(4)}} className='font-bold tracking-wider text-center text-neutral-800'>Welcome Back to EduAssist</Text>
        <View className='gap-4'>
          <View style={{height: hp(7)}} className='flex-row gap-4 px-4 bg-neutral-200 items-center rounded-xl'>
            <Octicons name='mail' size={hp(2.7)} color='gray' />
            <TextInput
              onChangeText={value=>emailRef.current=value}
              style={{fontSize: hp(2)}}
              className='flex-1 font-semibold text-neutral-700'
              placeholder='Email'
              placeholderTextColor={'gray'} />
          </View>

          <View className='gap-3'>
            <View style={{height: hp(7)}} className='flex-row gap-4 px-4 bg-neutral-200 items-center rounded-xl'>
              <Octicons name='lock' size={hp(2.7)} color='gray' />
              <TextInput
                onChangeText={value=>passwordRef.current=value}
                style={{fontSize: hp(2)}}
                className='flex-1 font-semibold text-neutral-700'
                placeholder='Password'
                secureTextEntry
                placeholderTextColor={'gray'} />
            </View>

            <Text style={{fontSize: hp(1.8)}} className='text-right text-neutral-700'>Forgot Password?</Text>
          </View>

          {/* submit button */}
          <View>
            {/* {
              loading? (
                <View className='flex-row justify-center'>
                  <Loading size={hp(8)} />
                </View>
              ):( */}
                  <TouchableOpacity onPress={handleLogin} style={{height: hp(6.5)}} className='bg-red-600 items-center justify-center rounded-xl'>
                    <Text style={{fontSize: hp(2.7)}} className='font-bold text-white tracking-wider'>Sign In</Text>
                  </TouchableOpacity>
              {/* )
            } */}
          </View>

          {/* sign up text */}
          <View className='flex-row justify-center'>
            <Text style={{fontSize: hp(1.8)}} className='font-semibold text-neutral-700'>Don't have an account? </Text>
            <Pressable onPress={() => router.push('signUp')}>
              <Text style={{fontSize: hp(1.8)}} className='text-red-600 font-bold'>Sign Up</Text>
            </Pressable>
          </View>

        </View>
      </View>
    </View>
  )
}