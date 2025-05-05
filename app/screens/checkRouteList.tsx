import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { images } from '@/constants/images';
import BackButton from '@/components/BackButton';

const data = [
  { id: '1', label: 'Route 1', color: 'border-red-500', location: 'QC Hall - Cubao' },
  { id: '2', label: 'Route 2', color: 'border-pink-500', location: 'QC Hall - Litex / IBP Hall' },
  { id: '3', label: 'Route 3', color: 'border-yellow-500', location: 'Welcome Rotonda - Aurora Katipunan' },
  { id: '4', label: 'Route 4', color: 'border-purple-500', location: 'QC Hall - General Luis' },
  { id: '5', label: 'Route 5', color: 'border-orange-500', location: 'QC Hall - Mindanao Ave. via Visayas Ave.' },
  { id: '6', label: 'Route 6', color: 'border-green-500', location: 'QC Hall - Gilmore' },
  { id: '7', label: 'Route 7', color: 'border-blue-500', location: 'QC Hall - C5 / Ortigas Avenue' },
  { id: '8', label: 'Route 8', color: 'border-blue-700', location: 'QC Hall - Muñoz' },
];


const RouteList = () => {
  const router = useRouter();

  const handlePress = (routeId: string) => {
    router.push({ pathname: '/screens/routes/checkRoute[Id]', params: { routeId } });
  };

  return (
    <View className="flex-1 bg-white">
      <BackButton />
          <View className="w-full h-32 bg-primary flex-row rounded-b-3xl items-center justify-center">
            <BackButton />
            <Image source={images.cityBusLogo} className="w-20 h-20" resizeMode="contain" />
            <Text className="text-3xl font-bold text-center text-white mr-10">Routes</Text>
          </View>

          <View className="flex-1 px-4 mt-20">
            <FlatList
              data={data}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <>
                  <TouchableOpacity
                    className={`border-2 ${item.color} p-5 rounded-xl mb-10 flex-row items-center justify-center`}
                    onPress={() => handlePress(item.id)}
                    >
                    <Image source={images.cityBusLogo} className='size-16'/>
                    <Text className="text-black text-center font-semibold uppercase text-xl mr-10">
                      {item.label}
                    </Text>

                  </TouchableOpacity>
                  <Text className='relative bottom-10 text-center font-semibold'>{item.location}</Text>
                </>
              )}
              />
      </View>
    </View>

  );
};

export default RouteList;
