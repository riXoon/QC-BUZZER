import { useLocalSearchParams } from 'expo-router';
import { ScrollView, View, Text, StyleSheet, Image, PanResponder } from 'react-native';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { images } from '@/constants/images';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { getRoute } from '@/service/openRouteService';
import BackButton from '@/components/BackButton';
import { supabase } from '@/service/supabaseClient';

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
};

const RouteDetails = () => {
  const { routeId, latitude, longitude } = useLocalSearchParams();
  const [locationGranted, setLocationGranted] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routePath, setRoutePath] = useState<Stop[]>([]);
  const [generatedRoute, setGeneratedRoute] = useState<{ latitude: number; longitude: number }[]>([]);
  const [mapHeight, setMapHeight] = useState(500);
  const mapRef = useRef<MapView>(null);

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
        .select('latitude, longitude, location')
        .eq('route_id', routeId)
        .order('stop_order', { ascending: true });

      if (error) {
        console.error('Error fetching route stops:', error);
      } else if (data) {
        setRoutePath(data as Stop[]);
      }
    };

    fetchStops();
  }, [routeId]);

  // Fetch snapped route from OpenRouteService
  useEffect(() => {
    const fetchRoute = async () => {
      if (routePath.length === 0) return;

      try {
        const coordinates = routePath.map(point => [point.longitude, point.latitude]);
        const data = await getRoute(coordinates);
        if (data.features && data.features.length > 0) {
          const extractedCoords = data.features[0].geometry.coordinates.map(
            ([lon, lat]: [number, number]) => ({ latitude: lat, longitude: lon })
          );
          setGeneratedRoute(extractedCoords);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchRoute();
  }, [routePath]);

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
            />
          ))}
          {generatedRoute.length > 0 && (
            <Polyline coordinates={generatedRoute} strokeColor="#0000FF" strokeWidth={4} />
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
        <Text className="text-xl font-bold">Bus Information</Text>
        <Text className="text-base mt-2">
          You are currently viewing route {routeId}. Scroll down for more details!
        </Text>
      </View>
    </ScrollView>
  );
};

export default RouteDetails;
