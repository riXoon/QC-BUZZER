import { View, Text, FlatList, Pressable, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/service/supabaseClient'; // Import your existing supabase client
import * as Notifications from 'expo-notifications'; // Import Notifications from expo-notifications
import BackButton from '@/components/BackButton';
import { images } from '@/constants/images';
import { registerForPushNotificationsAsync } from '@/service/usePushNotification'; // Import your push notification registration function
import { push } from 'expo-router/build/global-state/routing';

const SelectStop = () => {
  const router = useRouter();
  const { routeId } = useLocalSearchParams(); // Get routeId from params
  const [stops, setStops] = useState<{ id: string; location: string; latitude: number; longitude: number; stop_order: number }[]>([]); // State to store fetched stops

  useEffect(() => {
    const fetchStops = async () => {
      try {
        const { data, error } = await supabase
          .from('bus_route_stops')
          .select('id, location, latitude, longitude, stop_order')
          .eq('route_id', routeId) // Filter by route_id
          .order('stop_order', { ascending: true }); // Order by stop_order

        if (error) {
          console.error('Error fetching stops:', error);
          return;
        }

        setStops(data.map((stop) => ({
          id: stop.id,
          location: stop.location,
          latitude: stop.latitude,
          longitude: stop.longitude,
          stop_order: stop.stop_order,
        })));
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchStops();
  }, [routeId]);

  const handleSelectStop = (stop: { id: string; location: string; latitude: number; longitude: number, stop_order:number }) => {
    console.log(`Selected stop ID: ${stop.id}`);
    router.push({
      pathname: '/screens/routes/waitRoute[Id]',
      params: {
        routeId,
        stopId: stop.id,
        latitude: stop.latitude.toString(),
        longitude: stop.longitude.toString(),
        stopOrder: stop.stop_order.toString(), // Pass stop_order as a string
      },
    });
  };

  const handleSubscribe = async (selectedStopId: string) => {
    const pushToken = await registerForPushNotificationsAsync(selectedStopId);
    
    if (!pushToken) return; // If no push token, return early.

    // Insert into the commuter_subscriptions table
    const { error } = await supabase.from('commuter_subscriptions').insert({
      stop_id: selectedStopId,
      expo_push_token: pushToken,
    });

    console.log('Saving token for stop:', selectedStopId, 'Token:', pushToken);


    if (error) {
      console.error('Subscription error:', error);
    } else {
      console.log('Successfully subscribed to stop:', selectedStopId);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <BackButton />
      <View className="w-full h-32 bg-primary flex-row rounded-b-3xl items-center justify-center">
        <Image source={images.cityBusLogo} className="w-20 h-20" resizeMode="contain" />
        <Text className="text-3xl font-bold text-center text-white mr-10">Select Stop</Text>
      </View>

      <Text className="text-3xl text-black font-semibold text-center top-10">What stop are you in?</Text>
      <View className="flex-1 px-5 mt-20">
        <FlatList
          data={stops}
          keyExtractor={(item) => item.id} // `id` should be a string from Supabase
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                handleSelectStop(item);
                handleSubscribe(item.id); // Subscribe when the stop is selected
              }}
              className="mb-5"
              android_ripple={{ color: '#ccc' }}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <View className="flex-row items-center p-5 bg-white rounded-2xl shadow-md border border-gray-200">
                <Image
                  source={images.busStopIcon}
                  className="w-12 h-12 mr-4"
                  resizeMode="contain"
                />
                <Text className="text-lg font-semibold text-gray-800">{item.location}</Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-10">
              <Image
                source={images.emptyStateIcon}
                className="w-24 h-24 mb-4"
                resizeMode="contain"
              />
              <Text className="text-gray-400 text-center text-lg">No stops available for this route.</Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

export default SelectStop;
