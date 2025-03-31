import { View, Text, TextInput, Pressable, TouchableOpacity, Alert } from 'react-native'
import React, { useRef, useState} from 'react'
import { StatusBar } from 'expo-status-bar';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Feather, Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Loading from '../components/loading';
import CustomKeyboardView from '../components/CustomKeyboardView';
import { useAuth } from '../context/authContext';


export default function signUp() {
  const router = useRouter();
  const {register} = useAuth();
  const [loading, setLoading] = useState(false);

  const emailRef = useRef("");
  const passwordRef = useRef("");
  const usernameRef = useRef("");

  const handleRegister = async () => {
    if (!emailRef.current || !passwordRef.current || !usernameRef.current) {
      Alert.alert('Sign Up', 'Please fill in all fields!');
      return;
    }

    setLoading(true);

    let response = await register(emailRef.current, passwordRef.current, usernameRef.current);
    setLoading(false);

    console.log("got result: ", response);
    if(!response.success){
      Alert.alert('Sign Up', response.msg);
    }
  }

  return (
    <CustomKeyboardView>
      <StatusBar style='dark' />
      <View style={{paddingTop: hp(30), paddingHorizontal: wp(5)}} className='flex-1 gap-12'>
        <Text style={{fontSize: hp(4)}} className='font-bold tracking-wider text-center text-neutral-800'>Welcome to EduAssist</Text>
        <View className='gap-4'>
        <View style={{height: hp(7)}} className='flex-row gap-4 px-4 bg-neutral-200 items-center rounded-xl'>
            <Feather name='user' size={hp(2.7)} color='gray' />
            <TextInput
              onChangeText={value=>usernameRef.current=value}
              style={{fontSize: hp(2)}}
              className='flex-1 font-semibold text-neutral-700'
              placeholder='Username'
              placeholderTextColor={'gray'} />
          </View>

          <View style={{height: hp(7)}} className='flex-row gap-4 px-4 bg-neutral-200 items-center rounded-xl'>
            <Octicons name='mail' size={hp(2.7)} color='gray' />
            <TextInput
              onChangeText={value=>emailRef.current=value}
              style={{fontSize: hp(2)}}
              className='flex-1 font-semibold text-neutral-700'
              placeholder='Email'
              placeholderTextColor={'gray'} />
          </View>

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



          {/* submit button */}
          <View>
            {
              loading? (
                <View className='flex-row justify-center'>
                  <Loading size={hp(5)} />
                </View>
              ):(
                  <TouchableOpacity onPress={handleRegister} style={{height: hp(6.5)}} className='bg-red-600 items-center justify-center rounded-xl'>
                    <Text style={{fontSize: hp(2.7)}} className='font-bold text-white tracking-wider'>Sign Up</Text>
                  </TouchableOpacity>
               )
            } 
          </View>

          {/* sign up text */}
          <View className='flex-row justify-center'>
            <Text style={{fontSize: hp(1.8)}} className='font-semibold text-neutral-700'>Already have an account? </Text>
            <Pressable onPress={() => router.push('signIn')}>
              <Text style={{fontSize: hp(1.8)}} className='text-red-600 font-bold'>Sign In</Text>
            </Pressable>
          </View>

        </View>

        {/* Privacy Plouicy  text */}
        <View className='flex-row justify-center pt-36'>
            <Text style={{fontSize: hp(1.4)}} className='font-semibold text-neutral-400'>Before creating an account read </Text>
            <Pressable onPress={() => router.push('terms')}>
              <Text style={{fontSize: hp(1.4)}} className='font-semibold text-red-400'>Terms and Conditions</Text>
            </Pressable>
        </View>
      </View>
    </CustomKeyboardView>
  )
}