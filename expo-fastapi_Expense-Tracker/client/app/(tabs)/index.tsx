import { ScrollView, Text, View } from 'react-native';
import { Link } from 'expo-router'; 
import React, { useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated'
import LottieView from 'lottie-react-native';
import Button from '@/components/Button';

export default function Index() {

  const animation = useRef<LottieView>(null)

  return (
    <SafeAreaView className='bg-primary h-full'>
      <ScrollView contentContainerStyle={{ height: '100%'}}>
        <View className='w-full justify-center items-center h-full px-4'>
          <Animated.View
            className="w-full"
            entering={FadeInDown.duration(300).springify()}
          >
            <LottieView 
              ref={animation}
              source={require('../../assets/images/oink.json')} 
              autoPlay loop
              style={{ width: 400, height: 400 }} 
            />
          </Animated.View>
          
          <Animated.View
            className="w-full"
            entering={FadeInDown.duration(300).delay(200).springify()}
          >
            <Text className='font-rblack text-4xl text-center leading-[2.5rem]'>
              Master Your Budget, Achieve Your Goals!
            </Text>
          </Animated.View>

          <Animated.View
            className="w-full mt-2"
            entering={FadeInDown.duration(300).delay(400).springify()}
          >
            <Text className='font-regular text-center leading-[4.5rem]'>
              Spend Smarter, Save Faster.
            </Text>
          </Animated.View>

          <Animated.View
            className="w-full justify-center items-center mt-10"
            entering={FadeInDown.duration(300).delay(600).springify()}
          >
            <Button title="Get Started"/>
          </Animated.View>


        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
