import { Image, ScrollView, Text, View } from 'react-native';
import { Link } from 'expo-router'; 
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import wallet from "../../assets/images/wallet.png"

export default function Index() {
  return (
    <SafeAreaView className='bg-primary h-full'>
      <ScrollView contentContainerStyle={{ height: '100%'}}>
        <View className='w-full justify-center items-center h-full px-4'>
          <Image 
            source={wallet}
            style={{ width: 400, height: 400 }}
          />
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
