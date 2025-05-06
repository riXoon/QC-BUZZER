import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useEffect, useState } from 'react';
import BackButton from '@/components/BackButton';
import { images } from '@/constants/images';
import { supabase } from '@/service/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const Status = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [busCode, setBusCode] = useState<string | null>(null);
  const router = useRouter();

  const fetchUserBusCode = async () => {
    try {
      const accountString = await AsyncStorage.getItem('busAccount');
      if (accountString) {
        const account = JSON.parse(accountString);
        return account.bus_code;
      } else {
        console.warn('No account data found in storage');
        return null;
      }
    } catch (err) {
      console.error('Error reading account from storage:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchUserBusCode().then((code) => setBusCode(code));
  }, []);

  const toggleStatus = () => {
    setIsOnline((prev) => !prev);
  };

  return (
    <View className="flex-1 bg-white px-6 pt-12 items-center gap-6">

      <View className="absolute top-10 left-4">
        <BackButton />
      </View>

      <Image source={images.qcBuzzerLogoDark} className="w-40 h-20 mt-10" resizeMode="contain" />

      <Text className="text-2xl font-semibold mb-2 mt-20">
        BUS CODE: {busCode ?? 'Loading...'}
      </Text>

      <View className="flex-row items-center space-x-1">
        <Image source={images.cityBusLogo} className="size-16" />
        <Text className={`text-xl font-bold ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
          {isOnline ? 'ONLINE' : 'OFFLINE'}
        </Text>
      </View>

      <View
        className={`w-40 h-40 rounded-full border-[6px] items-center justify-center ${
          isOnline ? 'border-green-500' : 'border-gray-300'
        }`}
      >
        <Text className="text-sm font-bold mb-2">KYUSIBUS</Text>
        <Image source={images.kyusibus} className="w-20 h-20" resizeMode="contain" />
      </View>


      {isOnline && (
        <View className="items-center mt-6 space-y-4">
          <TouchableOpacity
            className="bg-blue-700 px-10 py-6 rounded-full"
            onPress={() => router.push('./routeList')}
          >
            <Text className="text-white text-xl font-semibold">Check Route</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity
        className={`mt-10 px-8 py-4 rounded-full flex-row items-center space-x-3 gap-4 ${
          isOnline ? 'bg-green-600' : 'bg-gray-300'
        }`}
        onPress={toggleStatus}
      >
        <Image source={images.toggle} className="w-10 h-10" resizeMode="contain" />
        <Text className="text-xl font-semibold text-white">
          {isOnline ? 'ONLINE' : 'OFFLINE'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Status;
