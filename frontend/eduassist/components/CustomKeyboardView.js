import { View, Text, KeyboardAvoidingView, ScrollView } from 'react-native'
import React from 'react'

export default function CustomKeyboardView({children}) {
  return (
    <KeyboardAvoidingView behavior='padding' className='flex-1'>
        <ScrollView
            className='flex-1'
            bounces={false}
            showsVerticalScrollIndicator={false}
        >
            {
                children
            }
        </ScrollView>
    </KeyboardAvoidingView>

  )
}