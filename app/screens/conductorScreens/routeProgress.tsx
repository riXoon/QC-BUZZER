import { View, Text, Image, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/service/supabaseClient';
import BackButton from '@/components/BackButton';
import { images } from '@/constants/images';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendPushNotification } from '@/service/pushNotification'; 
import { Audio } from 'expo-av';


// Define TS-friendly shapes
interface Stop {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  stop_order: number;
}

/**
 * @typedef {Object} BusAccount
 * @property {number} id
 * @property {string} bus_code
 */

const RouteProgress = () => {
  const { routeId } = useLocalSearchParams();
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedStop, setSelectedStop] = useState(0);

  // Passenger states
  const [onboardPassengers, setOnboardPassengers] = useState(0);
  const [departedPassengers, setDepartedPassengers] = useState(0);
  const [nextStopSeats, setNextStopSeats] = useState(0);

  // Input states
  const [onboardInput, setOnboardInput] = useState('');
  const [departedInput, setDepartedInput] = useState('');
  const [nextSeatsInput, setNextSeatsInput] = useState('');

  // Authenticated user (bus account)
  interface BusAccount {
    id: string;
    bus_code: string;
  }
  
  const [busAccount, setBusAccount] = useState<BusAccount | null>(null);

  const SEAT_CAPACITY = 49;
  const availableSeats = SEAT_CAPACITY - onboardPassengers;

  useEffect(() => {
    // 1. Fetch stops
    const fetchStops = async () => {
      const { data, error } = await supabase
        .from('bus_route_stops')
        .select('id, location, latitude, longitude, stop_order')
        .eq('route_id', routeId)
        .order('stop_order', { ascending: true });
      if (error) console.error('Error fetching stops:', error);
      else setStops(data || []);
    };

    // 2. Retrieve session and fetch bus account linked to auth user
    const fetchBusAccount = async () => {
      try {
        const storedAccount = await AsyncStorage.getItem('busAccount');
        if (storedAccount) {
          const parsedAccount = JSON.parse(storedAccount);
          setBusAccount(parsedAccount);
        } else {
          console.error('No bus account found in storage');
        }
      } catch (error) {
        console.error('Failed to load bus account from storage:', error);
      }
    };
    

    fetchStops();
    fetchBusAccount();
  }, [routeId]);

  const handleNextStop = () => {
    if (selectedStop < stops.length - 1) {
      setSelectedStop(prev => prev + 1);
      setDepartedPassengers(0);
      setNextStopSeats(0);
    }
  };

  const handleUpdateOnboard = () => {
    const count = parseInt(onboardInput, 10);
    if (!isNaN(count)) {
      setOnboardPassengers(count);
      setOnboardInput('');
    }
  };

  const handleUpdateDeparted = () => {
    const count = parseInt(departedInput, 10);
    if (!isNaN(count) && count <= onboardPassengers) {
      setDepartedPassengers(count);
      setOnboardPassengers(prev => prev - count);
      setDepartedInput('');
    }
  };
  

  //notif sound pare
  const playNotificationSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('@/assets/audio/horn.mp3'),
      { shouldPlay: true }
    );
    await sound.playAsync();
  };
  

  // Inserts a seat log entry for next stop and sends notification
  const handleUpdateNextSeats = async () => {
    const count = parseInt(nextSeatsInput, 10);
    if (isNaN(count)) {
      Alert.alert('Invalid input', 'Enter a valid number');
      return;
    }
    setNextStopSeats(count);
    setNextSeatsInput('');
  
    if (!busAccount) {
      Alert.alert('Error', 'Bus account not loaded');
      return;
    }
  
    const stopId = stops[selectedStop].id;
  
    // 1) Update + return
    const { data, error } = await supabase
      .from('bus_route_stops')
      .update({ seats_next_stop: count })
      .eq('id', stopId)
      .select();
  
    if (error) {
      console.error('Error updating seats_next_stop:', error);
      Alert.alert('Database Error', error.message);
      return;
    }
  
    // 2) Merge into state so further edits keep working
    if (data && data.length) {
      const updatedStop = data[0];
      setStops(prev =>
        prev.map(s => (s.id === updatedStop.id ? { ...s, ...updatedStop } : s))
      );
    }
  
    // 3) Send notification to passengers at the next stop
    // Fetch push token for passengers at the next stop
    const { data: tokens, error: tokensError } = await supabase
      .from('commuter_subscriptions')  // Ensure this is your correct table
      .select('expo_push_token')
      .eq('stop_id', stops[selectedStop + 1]?.id);  // Get token for next stop
  
    if (tokensError) {
      console.error('Error fetching tokens:', tokensError);
      return;
    }
  
    // Send notifications to all tokens
    const nextLocation = stops[selectedStop]?.location;
    tokens?.forEach(({ expo_push_token }) => {
      sendPushNotification(expo_push_token, `Bus already arrived at ${nextLocation}. Seats available at the next stop: ${count}`);
    });
    
  

  };

  return (
    <View className="flex-1 bg-white px-4 pt-10">
      {/* Back Button */}
      <View className="absolute top-10 left-4">
        <BackButton />
      </View>

      {/* Header */}
      <View className="flex-row justify-center items-center mb-6">
        <Image source={images.qcBuzzerLogoDark} className="w-28 h-10" resizeMode="contain" />
        <Text className="text-green-600 text-lg font-bold ml-4">ONLINE</Text>
      </View>

      {/* Title */}
      <Text className="text-xl text-center font-semibold mb-6">You’re on your way!</Text>

      <View className="flex-row flex-1">
        {/* Stops List */}
        <ScrollView contentContainerStyle={{ paddingVertical: 16, paddingLeft: 16 }}>
          {stops.map((stop, idx) => (
            <View key={stop.id} className="flex-row items-center mb-6">
              <Text className="w-32 text-right text-sm font-medium mr-2">{stop.location}</Text>
              <View className="flex-col items-center">
                <View
                  style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: idx <= selectedStop ? '#2563EB' : '#D1D5DB' }}
                />
                {idx < stops.length - 1 && (
                  <View style={{ width: 2, height: 30, backgroundColor: '#D1D5DB' }} />
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Passenger Panels */}
        <ScrollView contentContainerStyle={{ paddingVertical: 16, paddingRight: 16 }}>
          {/* Onboard Passengers */}
          <View className="bg-gray-100 rounded-xl p-4 mb-4 w-52 mx-auto">
            <Text className="text-base font-semibold mb-1">Onboard Passengers</Text>
            <Text className="text-2xl font-bold mb-2 text-center">{onboardPassengers}</Text>
            <TextInput
              value={onboardInput}
              onChangeText={setOnboardInput}
              placeholder="#"
              keyboardType="numeric"
              editable={selectedStop === 0}
              className={`${selectedStop !== 0 ? 'opacity-50' : ''} bg-white p-1 rounded-lg mb-2 text-center`}
            />
            <TouchableOpacity
              onPress={handleUpdateOnboard}
              disabled={selectedStop !== 0}
              className={`${selectedStop === 0 ? 'bg-green-500' : 'bg-gray-300'} py-2 rounded-lg`}
            >
              <Text className="text-white text-center">Update</Text>
            </TouchableOpacity>
          </View>

          {/* Departed Passengers */}
          <View className="bg-gray-100 rounded-xl p-4 mb-4 w-52 mx-auto">
            <Text className="text-base font-semibold mb-1">Departed Passengers</Text>
            <Text className="text-2xl font-bold mb-2 text-center">{departedPassengers}</Text>
            <TextInput
              value={departedInput}
              onChangeText={setDepartedInput}
              placeholder="#"
              keyboardType="numeric"
              className="bg-white p-1 rounded-lg mb-2 text-center"
            />
            <TouchableOpacity onPress={handleUpdateDeparted} className="bg-green-500 py-2 rounded-lg">
              <Text className="text-white text-center">Update</Text>
            </TouchableOpacity>
          </View>

          {/* Seats Next Stop */}
          <View className="bg-gray-100 rounded-xl p-4 mb-4 w-52 mx-auto">
            <Text className="text-base font-semibold mb-1">Seats Next Stop</Text>
            <Text className="text-2xl font-bold mb-2 text-center">{nextStopSeats}</Text>
            <TextInput
              value={nextSeatsInput}
              onChangeText={setNextSeatsInput}
              placeholder="#"
              keyboardType="numeric"
              className="bg-white p-1 rounded-lg mb-2 text-center"
            />
            <TouchableOpacity onPress={handleUpdateNextSeats} className="bg-green-500 py-2 rounded-lg">
              <Text className="text-white text-center">Update</Text>
            </TouchableOpacity>
          </View>

          {/* Available Seats */}
          <View className="bg-gray-100 rounded-xl p-4 mb-4 w-52 mx-auto">
            <Text className="text-base font-semibold mb-1">Available Seats</Text>
            <Text className="text-2xl font-bold text-center">{availableSeats}</Text>
          </View>
        </ScrollView>
      </View>

      {/* Next Stop Button */}
      <TouchableOpacity
        onPress={handleNextStop}
        className="absolute bg-blue-600 p-4 rounded-xl bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <Text className="text-white text-lg font-semibold">Next Stop</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RouteProgress;
