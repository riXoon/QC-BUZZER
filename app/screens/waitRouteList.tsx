import { View, Text, Image, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { images } from '@/constants/images';
import BackButton from '@/components/BackButton';
import { supabase } from '@/service/supabaseClient';

interface Route {
  id: string;
  label: string;
  color: string;
  location: string;
}

const RouteList = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetching data from Supabase
  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('bus_routes')
        .select('*');
  
      if (error) {
        console.error('Error fetching routes:', error);
      } else {
        console.log('Fetched routes:', data);
        setRoutes(data); 
      }
      setLoading(false);
      };
  
    fetchRoutes();
  }, []);
  

  const handlePress = (route: Route) => {
    router.push({
      pathname: '/screens/selectStop',
      params: {
        routeId: route.id,
        label: route.label,
        location: route.location,
      },
    });
  };

  return (
    <View className="flex-1 bg-white">
      <BackButton />
      <View className="w-full h-32 bg-primary flex-row rounded-b-3xl items-center justify-center">
        <Image source={images.cityBusLogo} className="w-20 h-20" resizeMode="contain" />
        <Text className="text-3xl font-bold text-center text-white mr-10">Routes</Text>
      </View>

      <View className="flex-1 px-4 mt-20">
        {loading ? ( // Check if the data is still loading
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0000ff" /> {/* Loading spinner */}
            <Text className="mt-4 text-lg font-semibold text-gray-700">Loading routes...</Text> {/* Loading text */}
          </View>
        ) : (
          <FlatList
            data={routes} // Use the routes data fetched from Supabase
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View>
                <TouchableOpacity
                  className={`border-2 ${item.color} p-5 rounded-xl mb-2 flex-row items-center justify-center`}
                  onPress={() => handlePress(item)}
                >
                  <Image source={images.cityBusLogo} className="size-16" />
                  <Text className="text-black text-center font-semibold uppercase text-xl mr-10">
                    {item.label}
                  </Text>
                </TouchableOpacity>
                <Text className="text-center font-semibold mb-4">{item.location}</Text>
              </View>

            )}
          />
        )}
      </View>
    </View>
  );
};

export default RouteList;
