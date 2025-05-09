import { useLocalSearchParams } from 'expo-router';
import { ScrollView, View, Text, StyleSheet, Image, PanResponder } from 'react-native';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { images } from '@/constants/images';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { getRoute } from '@/service/openRouteService';
import BackButton from '@/components/BackButton';
import { supabase } from '@/service/supabaseClient';
import { registerForPushNotificationsAsync } from '@/service/usePushNotification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendPushNotification } from '@/service/pushNotification';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';


const routeConfigs: Record<string, { color: string; location: string }> = {
  '1': { color: 'bg-red-500', location: 'QC Hall - Cubao' },
  '2': { color: 'bg-pink-500', location: 'QC Hall - Litex / IBP Hall' },
  '3': { color: 'bg-yellow-500', location: 'Welcome Rotonda - Aurora Katipunan' },
  '4': { color: 'bg-purple-500', location: 'QC Hall - General Luis' },
  '5': { color: 'bg-orange-500', location: 'QC Hall - Mindanao Avenue via Visayas Avenue' },
  '6': { color: 'bg-green-500', location: 'QC Hall - Gilmore' },
  '7': { color: 'bg-blue-500', location: 'QC Hall - C5 / Ortigas Avenue' },
  '8': { color: 'bg-blue-700', location: 'QC Hall - Muñoz' },
};

type Stop = {
  latitude: number;
  longitude: number;
  location: string;
  seats_next_stop: number;
  stop_order: number;
};

const RouteDetails = () => {
  const { routeId, latitude, longitude, stopOrder } = useLocalSearchParams();
  const [locationGranted, setLocationGranted] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routePath, setRoutePath] = useState<Stop[]>([]);
  const [generatedRoute, setGeneratedRoute] = useState<{ latitude: number; longitude: number }[]>([]);
  const [mapHeight, setMapHeight] = useState(500);
  const mapRef = useRef<MapView>(null);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number>(0);
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);
  const [userStopOrder, setUserStopOrder] = useState<number | null>(null);


  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newHeight = Math.max(200, mapHeight + gestureState.dy);
        setMapHeight(newHeight);
      },
    })
  ).current;

  const routeData = routeConfigs[routeId as string] || { color: 'bg-gray-500', location: 'Unknown Route' };

  // Fetch route stops from Supabase
  useEffect(() => {
    const fetchStops = async () => {
      if (!routeId) return;

      const { data, error } = await supabase
        .from('bus_route_stops')
        .select('latitude, longitude, location, seats_next_stop, stop_order')
        .eq('route_id', routeId)
        .order('stop_order', { ascending: true });

      if (error) {
        console.error('Error fetching route stops:', error);
      } else if (data) {
        const stops = data as Stop[];
        setRoutePath(stops);

        // Automatically select stop based on stopOrder
        if (stopOrder) {
          const order = parseInt(stopOrder as string, 10);
          setUserStopOrder(order); // Store user's stop order
          const index = stops.findIndex((stop) => stop.stop_order === order);
          if (index !== -1) {
            setSelectedStopIndex(index);
          }
        }
        
      }
    };

    fetchStops();
  }, [routeId, stopOrder]);

  // Fetch snapped route from OpenRouteService
  useEffect(() => {
    const fetchRoute = async () => {
      if (routePath.length === 0) return;

      try {
        const coordinates = routePath.map(point => [point.longitude, point.latitude]);
        const data = await getRoute(coordinates);

        const extractedCoords = data.geometry.map(
          ([lon, lat]: [number, number]) => ({ latitude: lat, longitude: lon })
        );
        setGeneratedRoute(extractedCoords);

        if (data.duration) {
          const minutes = Math.round(data.duration / 60);
          setEtaMinutes(minutes);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchRoute();
  }, [routePath]);

  useEffect(() => {
    const fetchETA = async () => {
      if (
        routePath.length === 0 ||
        selectedStopIndex === 0 || // no previous stop
        selectedStopIndex >= routePath.length
      ) return;

      const prevStop = routePath[selectedStopIndex - 1];
      const currStop = routePath[selectedStopIndex];

      const coordinates = [
        [prevStop.longitude, prevStop.latitude],
        [currStop.longitude, currStop.latitude]
      ];

      try {
        const data = await getRoute(coordinates);

        if (data.duration) {
          const minutes = Math.round(data.duration / 60);
          setEtaMinutes(minutes);
        }
      } catch (error) {
        console.error('Error fetching ETA between stops:', error);
      }
    };

    fetchETA();
  }, [routePath, selectedStopIndex]);

  // Update selected location based on query or fallback
  useEffect(() => {
    if (latitude && longitude) {
      setSelectedLocation({
        latitude: parseFloat(latitude as string),
        longitude: parseFloat(longitude as string),
      });
    } else if (routePath.length > 0) {
      setSelectedLocation({
        latitude: routePath[0].latitude,
        longitude: routePath[0].longitude,
      });
    }
  }, [latitude, longitude, routePath]);

  // Animate map to selected location
  useEffect(() => {
    if (selectedLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [selectedLocation]);

  // Request location permission
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationGranted(status === 'granted');
    })();
  }, []);


//useEffect to play sound when a notification is received
  useEffect(() => {
    const playSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('@/assets/audio/horn.mp3'), // Make sure this file exists!
          { shouldPlay: true }
        );
        await sound.playAsync();
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    };
  
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      playSound();
    });
  
    return () => {
      subscription.remove();
    };
  }, []);
  

  const INITIAL_REGION = routePath.length > 0
    ? {
        latitude: routePath[0].latitude,
        longitude: routePath[0].longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : {
        latitude: 14.6514,
        longitude: 121.0509,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };

  // Save push token only once for each stop using AsyncStorage
  const savePushToken = async (routeId: string, stopOrder: number) => {
    const savedTokenKey = `push_token_${routeId}_${stopOrder}`;
    const savedToken = await AsyncStorage.getItem(savedTokenKey);
  
    // Skip saving if the token is already saved for this route and stop
    if (savedToken) {
      console.log('Push token already saved for this stop.');
      return;
    }
  
    // Register for push notifications and get the token
    const token = await registerForPushNotificationsAsync(stopOrder ? stopOrder.toString() : '');
    if (!token) return;
  
    // Save the token to Supabase
    const { data, error } = await supabase
        .from('commuter_subscriptions')
        .upsert({ token, route_id: routeId, stop_order: stopOrder })
        .select();

    if (error) {
      console.error('Error saving push token to Supabase:', error);
      return;
    }

    console.log('Push token saved to Supabase:', data);

    // Save the token locally to AsyncStorage to prevent re-saving
    await AsyncStorage.setItem(savedTokenKey, token);
  };
  

  useEffect(() => {
    const currentRouteId = routeId as string;
    const parsedStopOrder = stopOrder ? parseInt(stopOrder as string, 10) : 0;
  
    if (currentRouteId && stopOrder) {
      savePushToken(currentRouteId, parsedStopOrder);
    }
  }, [routeId, stopOrder]);

  const sendStopNotification = async (stopOrder: number) => {
    console.log('Checking for push notification for stop:', stopOrder);
  
    const { data, error } = await supabase
      .from('commuter_subscriptions')
      .select('expo_push_token')
      .eq('route_id', routeId)
      .eq('stop_order', stopOrder);
  
    if (error) {
      console.error('Error fetching push token:', error);
      return;
    }
  
    if (data && data[0]) {
      console.log('Push token found:', data[0].expo_push_token); // Check if token exists
      const pushToken = data[0].expo_push_token;
  
      console.log(`Sending notification for stop ${stopOrder}`);
      sendPushNotification(pushToken, `You are approaching stop ${stopOrder}`);
    } else {
      console.log('No push token found for stop:', stopOrder);
    }
  };
  

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
      <View className={`w-full h-40 justify-center items-center rounded-b-3xl ${routeData.color}`}>
        <BackButton />
        <View className="flex-row items-center">
          <Image source={images.cityBusLogo} className="w-20 h-20" resizeMode="contain" />
          <Text className="text-4xl font-bold text-white mr-10">Route {routeId}</Text>
        </View>
        <Text className="text-white font-semibold text-lg px-16 text-center">{routeData.location}</Text>
      </View>

      {/* Map */}
      <View style={{ height: mapHeight }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          provider={PROVIDER_GOOGLE}
          initialRegion={INITIAL_REGION}
          showsUserLocation={locationGranted}
          showsTraffic
        >
          {routePath.map((point, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: point.latitude, longitude: point.longitude }}
              title={point.location}
              description={`Stop ${index + 1}`}
              onPress={() => setSelectedStopIndex(index)}
            />
          ))}
          {generatedRoute.length > 0 && (
            <Polyline coordinates={generatedRoute} strokeColor="rgba(0, 0, 255, 0.5)" strokeWidth={4} />
          )}
        </MapView>

        <View
          {...panResponder.panHandlers}
          style={{ height: 20, backgroundColor: '#ccc', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: 'black' }}>⇅ Drag to resize map</Text>
        </View>
      </View>

      {/* Info Section */}
      <View style={{ padding: 20 }}>
      <Text className="text-xl font-bold">
        You are currently at `{routePath[selectedStopIndex] && routePath[selectedStopIndex].location ? routePath[selectedStopIndex].location : 'Unknown Location'} bus stop
      </Text>


        {/* Show seats_next_stop for the selected stop */}
        {routePath[selectedStopIndex] && (
          <View className="p-4 bg-white rounded-lg shadow-lg mb-4 mt-6">
            <Text className="text-xl font-semibold text-gray-800">
              Next stop: 
              <Text className="font-bold text-blue-600">
                {routePath[selectedStopIndex + 1] ? routePath[selectedStopIndex + 1].location : 'End of route'}
              </Text>
            </Text>

            <Text className="text-base text-gray-600 mt-2">
              Available seats for this stop: 
              <Text className="font-semibold text-green-600">
                {selectedStopIndex > 0 ? routePath[selectedStopIndex - 1].seats_next_stop : '0'}
              </Text>
            </Text>
          </View>
        )}

        {/* ETA display */}
        {etaMinutes !== null && (
          <View className="p-4 bg-white rounded-lg shadow-lg">
            <Text className="text-base text-gray-800">
              ETA from previous stop: 
              <Text className="font-semibold text-orange-600">
                {etaMinutes} minute{etaMinutes === 1 ? '' : 's'}
              </Text>
            </Text>
          </View>
        )}

        
      </View>
    </ScrollView>
  );
};

export default RouteDetails;
