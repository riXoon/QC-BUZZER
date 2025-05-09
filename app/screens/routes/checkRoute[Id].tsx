import { useLocalSearchParams } from 'expo-router';
import { View, Text, Image, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { images } from '@/constants/images';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { getRouteById } from '@/service/supaBaseService';
import BackButton from '@/components/BackButton';
import { getRoute as getORSRoute } from '@/service/openRouteService';

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

const RouteDetails = () => {
  const { routeId } = useLocalSearchParams();
  const [locationGranted, setLocationGranted] = useState(false);
  const [routeData, setRouteData] = useState<any>(null);
  const [snappedRoute, setSnappedRoute] = useState<{ latitude: number; longitude: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const route = await getRouteById(routeId as string);
        if (route) {
          setRouteData(route);

          const stopCoords = route.bus_route_stops.map((stop: any) => [stop.longitude, stop.latitude]);

          const orsData = await getORSRoute(stopCoords);
          const snappedCoords = orsData?.geometry?.coordinates.map(
            ([lng, lat]: [number, number]) => ({
              latitude: lat,
              longitude: lng,
            })
          );

          if (snappedCoords?.length) {
            setSnappedRoute(snappedCoords);
          }
        }
      } catch (error) {
        console.error('Failed to fetch and process route:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [routeId]);

  useEffect(() => {
    const getLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationGranted(status === 'granted');
    };
    getLocationPermission();
  }, []);

  const INITIAL_REGION = snappedRoute.length > 0
    ? {
        latitude: snappedRoute[0].latitude,
        longitude: snappedRoute[0].longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : {
        latitude: 14.6514,
        longitude: 121.0509,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };

  const routeConfig = routeConfigs[routeId as string];

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!routeData) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Route not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <BackButton />
      <View className={`w-full h-40 justify-center items-center rounded-b-3xl ${routeConfig?.color || 'bg-gray-500'}`}>
        <View className="flex-row items-center">
          <Image source={images.cityBusLogo} className="w-20 h-20" resizeMode="contain" />
          <Text className="text-4xl font-bold text-white mr-10">Route {routeId}</Text>
        </View>
        <Text className="text-white font-semibold text-lg px-16 text-center">
          {routeConfig?.location || routeData.label}
        </Text>
      </View>

      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={INITIAL_REGION}
        showsUserLocation={locationGranted}
        showsMyLocationButton={true}
        showsTraffic={true}
      >
        {routeData.bus_route_stops.map((stop: any, index: number) => (
          <Marker
            key={index}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
            title={stop.location || `Stop ${index + 1}`}
            description={`Stop ${index + 1}`}
          />
        ))}

        {snappedRoute.length > 0 && (
          <Polyline
            coordinates={snappedRoute}
            strokeColor="#0000FF"
            strokeWidth={4}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
  },
});

export default RouteDetails;
