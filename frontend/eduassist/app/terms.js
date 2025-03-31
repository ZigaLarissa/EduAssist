import React from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';

const TermsAndConditions = () => {
  const router = useRouter();

  return (
    <ScrollView className="p-8 bg-white">
      <View className="mb-4">
        <Text className="text-2xl font-bold">Terms and Conditions</Text>
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold">1. Introduction</Text>
        <Text className="text-gray-600">Welcome to EduAssist. By using this app, you agree to these Terms and Conditions. If you do not agree, please discontinue use immediately.</Text>
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold">2. User Data Processing</Text>
        <Text className="text-gray-600">EduAssist processes the information you provide to manage your account and improve our services. This includes data such as your name, email, role (teacher or parent), and interactions within the app. Your data is securely stored on our cloud infrastructure and is not shared with third parties except as required by law.</Text>
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold">3. User-Generated Content</Text>
        <Text className="text-gray-600">Users can submit messages, announcements, and assignments within the app. By posting content, you affirm that you have the right to do so and that the content does not violate any laws or rights of others. EduAssist reserves the right to remove inappropriate content without notice.</Text>
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold">4. Account Termination</Text>
        <Text className="text-gray-600">EduAssist reserves the right to suspend or terminate your account if you violate these terms, engage in misconduct, or misuse the platform. If your account is terminated, you may lose access to your data. You may request account deletion by contacting our support team.</Text>
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold">5. Dispute Resolution</Text>
        <Text className="text-gray-600">All disputes arising from the use of EduAssist shall be resolved in accordance with applicable laws. Disputes may be handled through arbitration or legal proceedings in the jurisdiction where our company operates. Users agree to attempt mediation before pursuing legal action.</Text>
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold">6. Changes to Terms</Text>
        <Text className="text-gray-600">EduAssist may update these Terms and Conditions periodically. We will notify users of significant changes. Continued use of the app after updates signifies acceptance of the revised terms.</Text>
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold">7. Privacy Policy</Text>
        <Text className="text-gray-600">For more details on how we collect, use, and protect your data, please review our Privacy Policy available within the app.</Text>
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold">8. Contact</Text>
        <Text className="text-gray-600">For any questions, concerns, or support requests, please contact us at support@eduassist.com.</Text>
      </View>

      <Pressable onPress={() => router.push('signUp')} className='flex-row justify-center mt-4 mb-16'>
        <Text style={{ fontSize: hp(1.4) }} className='font-semibold text-red-400'>Go Back</Text>
      </Pressable>
    </ScrollView>
  );
};

export default TermsAndConditions;
