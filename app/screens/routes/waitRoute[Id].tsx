import { useLocalSearchParams } from 'expo-router';
import { ScrollView, View, Text, StyleSheet, Image, PanResponder } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { images } from '@/constants/images';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { getRoute } from '@/service/openRouteService';
import BackButton from '@/components/BackButton';
import { Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // <--- import this
import { useCallback } from 'react';

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

const routePaths: Record<string, { path: { latitude: number; longitude: number; location: string }[] }> = {
  '1': {
    path: [
      { latitude: 14.648470418476709, longitude: 121.05111976402122, location: 'Quezon City Hall' },
      { latitude: 14.64433444753359, longitude: 121.05368593407127, location: 'Kalayaan Ave. Cor. Masigla Street' },
      { latitude: 14.633268792854448, longitude: 121.05388752744793, location: 'Kalayaan Ave. Cor. Kamias Road Interchange' },
      { latitude: 14.628984319683413, longitude: 121.05615016957304, location: 'Barangay Silangan Hall' },
      { latitude: 14.624143560250321, longitude: 121.05528453165783, location: '15th Ave / Yale Street Cor. Aurora Blvd' },
      { latitude: 14.623430032973733, longitude: 121.05566616374077, location: 'Cubao Ali Mall' },
    ],
  },
  '2': {
    path: [
      { latitude: 14.6514, longitude: 121.0509, location: 'Quezon City Hall' },
      { latitude: 14.681914853715025, longitude: 121.08526106903086, location: 'Commonwealth Ave. (St. Peter Parish Church)'},
      { latitude: 14.68628352290432, longitude: 121.08906703558222, location: 'IBP Road Maclang General Hospital' },
      { latitude: 14.689322571026349, longitude: 121.0942671098347, location: 'IBP Road Quezon City University - Batasan Hills' },
      { latitude: 14.6760, longitude: 121.1000, location: 'Litex / IBP Hall' },
    ],
  },
  '3': {
  path: [
    { latitude: 14.617914663661258, longitude: 121.00213698374634, location: 'Welcome Rotonda Cor. E Rodriguez Sr. Ave' },
    { latitude: 14.618879814465808, longitude: 121.01374605517098, location: 'E Rodriguez Sr. Ave Cor. Araneta Ave. Quezon Institute' },
    { latitude: 14.620636413514221, longitude: 121.02058939385135, location: 'E Rodriguez Sr. Ave. St. Lukes / National Children’s Hospital' },
    { latitude: 14.623174995678864, longitude: 121.02903636815324, location: 'E Rodriguez Sr. Ave. Cor. Gilmore Interchange' },
    { latitude: 14.627895081980581, longitude: 121.03464416113617, location: 'Kamuning road Delgado Hospital (Kamuning Market)' },
    { latitude: 14.630033207386793, longitude: 121.04302458019855, location: 'Kamuning road K-E Street' },
    { latitude: 14.630886927793561, longitude: 121.04622846454505, location: 'Kamias road Edsa' },
    { latitude: 14.633179808449706, longitude: 121.05388788508593, location: 'Kalayana Ave. Cor. Kamias Interchange' },
    { latitude: 14.634499091047815, longitude: 121.05874695637706, location: 'Kamias road Cor Anonas' },
    { latitude: 14.632388235082528, longitude: 121.06017244923797, location: 'Anonas road Chico Street' },
    { latitude: 14.627915300638325, longitude: 121.06475134145627, location: 'Aurora blvd LRT 2 Anonas Station' },
    { latitude: 14.629208792319545, longitude: 121.06926678477576, location: 'Aurora Blvd JP Rizal St' },
    { latitude: 14.631249921444319, longitude: 121.07260593356285, location: 'Aurora blvd Cor. Katipunan Interchange' },
  ],
},
'4': {
  path: [
    { latitude: 14.648448404877666, longitude: 121.04985195739276, location: 'QC Hall NHA Interchange' },
    { latitude: 14.65359768509694, longitude: 121.03952631776232, location: 'North Ave Veterans Hospital / Vertis North' },
    { latitude: 14.655487652100192, longitude: 121.03538652076975, location: 'Mindanao Ave Cor Road 1' },
    { latitude: 14.668336816518044, longitude: 121.03381961300053, location: 'Mindanao Ave Cor Congressional Ave' },
    { latitude: 14.677370745958132, longitude: 121.03230741943025, location: 'Mindanao Ave Cor. Tandang Sora Ave' },
    { latitude: 14.688049243426256, longitude: 121.03112369350421, location: 'Mindanao Ave Cor. Sauyo road' },
    { latitude: 14.690469835652866, longitude: 121.02815522294607, location: 'Mindanao Ave Cor. Quirino Highway' },
    { latitude: 14.699999225655494, longitude: 121.03457006938143, location: 'QCU Main Campus' },
    { latitude: 14.707837086244083, longitude: 121.03891762125674, location: 'SM Novaliches' },
    { latitude: 14.716235876119459, longitude: 121.04041698598485, location: 'Foresthill Drives' },
    { latitude: 14.721874992392632, longitude: 121.03892052384066, location: 'Gen Luis Novaliches Bayan' },
    { latitude: 14.72054777954118, longitude: 121.02835419587072, location: 'Gen Luis Banahaw St.' },
    { latitude: 14.719500230758308, longitude: 121.02117756607956, location: 'Gen Luis SB Road' },
  ],
},
'5': {
  path: [
    { latitude: 14.648448404877666, longitude: 121.04985195739276, location: 'QC Hall (NHA Interchange)' },
    { latitude: 14.6530, longitude: 121.0465, location: 'Visayas Ave. cor. Elliptical Road' },
    { latitude: 14.6555, longitude: 121.0387, location: 'Visayas Ave. cor. Congressional Ave.' },
    { latitude: 14.6572, longitude: 121.0352, location: 'Visayas Ave. cor. Mindanao Ave.' },
    { latitude: 14.677269288527688, longitude: 121.03188740169037, location: 'Mindanao Ave. cor. Tandang Sora Ave.' },
    { latitude: 14.69055462638983, longitude: 121.02787019736633, location: 'Mindanao Ave. cor. Quirino Highway' },
  ],
},
'6': {
  path: [
    { latitude: 14.648448404877666, longitude: 121.04985195739276, location: 'QC Hall (NHA Interchange)' },
    { latitude: 14.6300, longitude: 121.0462, location: 'Kalayaan Ave. cor. Kamias Road' },
    { latitude: 14.6345, longitude: 121.0587, location: 'Kamias Road cor. Anonas' },
    { latitude: 14.6231, longitude: 121.0290, location: 'Aurora Blvd. cor. Gilmore Ave.' },
  ],
},
'7': {
  path: [
    { latitude: 14.648448404877666, longitude: 121.04985195739276, location: 'QC Hall (NHA Interchange)' },
    { latitude: 14.6450, longitude: 121.0700, location: 'C.P. Garcia Ave. (Krus na Ligas)' },
    { latitude: 14.6360, longitude: 121.0770, location: 'Katipunan Ave. (UP Town Center)' },
    { latitude: 14.6320, longitude: 121.0790, location: 'Katipunan Ave. (Ateneo Gate 2)' },
    { latitude: 14.6300, longitude: 121.0800, location: 'Katipunan Ave. (Monasterio Real / LRT 2 Station)' },
    { latitude: 14.6280, longitude: 121.0820, location: 'Katipunan Ave. cor. P. Tuazon (Quirino Memorial Medical Center)' },
    { latitude: 14.6260, longitude: 121.0840, location: 'E. Rodriguez Jr. Ave. cor. Eastwood (Orchard Road Footbridge)' },
    { latitude: 14.6240, longitude: 121.0860, location: 'E. Rodriguez Jr. Ave. cor. Green Meadows Ave. (Jollibee)' },
    { latitude: 14.6220, longitude: 121.0880, location: 'E. Rodriguez Jr. Ave. cor. Ortigas Ave. Flyover' },
  ],
},
'8': {
  path: [
    { latitude: 14.648448404877666, longitude: 121.04985195739276, location: 'QC Hall (NHA Interchange)' },
    { latitude: 14.6500, longitude: 121.0460, location: 'Elliptical Road cor. Quezon Ave.' },
    { latitude: 14.6530, longitude: 121.0400, location: 'Quezon Ave. cor. Roosevelt Ave.' },
    { latitude: 14.6560, longitude: 121.0350, location: 'Roosevelt Ave. cor. Del Monte Ave.' },
    { latitude: 14.6590, longitude: 121.0300, location: 'Muñoz Market / LRT 1 Roosevelt Station' },
  ],
},



};

const routeCache: Record<string, { latitude: number; longitude: number }[]> = {};

const RouteDetails = () => {
    const { routeId } = useLocalSearchParams();
    const [locationGranted, setLocationGranted] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [generatedRoute, setGeneratedRoute] = useState<{ latitude: number; longitude: number }[]>([]);
    const [mapHeight, setMapHeight] = useState(500);
    const { latitude, longitude } = useLocalSearchParams();
    const mapRef = useRef<MapView>(null);

  
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
          const newHeight = Math.max(200, mapHeight + gestureState.dy); // Set min height 200
          setMapHeight(newHeight);
        },
      })
    ).current;
  
    const routeData = routeConfigs[routeId as string] || { color: 'bg-gray-500', location: 'Unknown Route' };
    const routePath = routePaths[routeId as string]?.path || [];
  
    // Location permissions
    useEffect(() => {
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationGranted(status === 'granted');
      })();
    }, []);

  
    // Fetch route
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
    }, [routeId]);

    //watch for changes in latitude and longitude
    // and update selectedLocation state accordingly
    useEffect(() => {
      if (latitude && longitude) {
        setSelectedLocation({
          latitude: parseFloat(latitude as string),
          longitude: parseFloat(longitude as string),
        });
      } else if (routePath.length > 0) {
        // Fallback: zoom to first route path point
        setSelectedLocation({
          latitude: routePath[0].latitude,
          longitude: routePath[0].longitude,
        });
      }
    }, [latitude, longitude, routePath]);
    
      

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
          {/* Resize Handler */}
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
  
          {/* Add more details here */}
        </View>
      </ScrollView>
    );
  };
  
  export default RouteDetails;