import React, { useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { images } from '@/constants/images';
import { SafeAreaView } from 'react-native-safe-area-context';

const slides = [
  {
    image: images.onboarding1,
    title: 'What is QC Buzzer?',
    description:
      'An app dedicated for Libreng Sakay commuters to navigate through the Bus Program.',
  },
  {
    image: images.onboarding2,
    title: 'What is QC Buzzer for?',
    description:
      'It aids commuters to get the information they need when it comes to travelling using the Quezon City Libreng Sakay Buses.',
  },
  {
    image: images.onboarding3,
    title: 'Looking for Libreng Sakay Routes',
    description:
      'Just click on the app, open notifications and search where you headed for!',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const swiperRef = useRef<Swiper>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/roleSelect');
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      swiperRef.current?.scrollBy(1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 relative">
        {/* Progress indicator */}
        <View className="absolute top-4 right-6 z-20">
          <Text className="text-gray-500">{`${currentIndex + 1}/${slides.length}`}</Text>
        </View>

        {/* Swiper */}
        <Swiper
          ref={swiperRef}
          loop={false}
          showsPagination={true}
          onIndexChanged={(index) => setCurrentIndex(index)}
        >
          {slides.map((slide, index) => (
            <View
              key={index}
              className="flex-1 justify-start items-center bg-white pt-12 gap-16"
            >
              <Image
                source={slide.image}
                className="w-full h-80 mb-6"
                resizeMode="cover"
              />
              <View className="px-6 gap-10">
                <Text className="text-3xl font-bold text-center">{slide.title}</Text>
                <Text className="text-base text-center text-gray-500 mt-2">
                  {slide.description}
                </Text>
              </View>

              {index === slides.length - 1 && (
                <TouchableOpacity
                  onPress={completeOnboarding}
                  className="mt-8 bg-blue-600 px-6 py-3 rounded-full"
                >
                  <Text className="text-white font-bold text-base">Get Started</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </Swiper>

        {/* Bottom Buttons */}
        {currentIndex < slides.length - 1 && (
          <View className="absolute bottom-10 left-0 right-0 flex-row justify-between px-6 z-20">
            <TouchableOpacity onPress={handleSkip}>
              <Text className="text-blue-600 text-base">Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext}>
              <Text className="text-blue-600 text-base">Next</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
