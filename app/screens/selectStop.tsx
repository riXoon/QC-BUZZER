import { View, Text, FlatList, TouchableOpacity, Image, Pressable } from 'react-native'
import React from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import BackButton from '@/components/BackButton'
import { images } from '@/constants/images'


const stopsData: Record<string, { id: string, stopName: string, latitude: number, longitude: number }[]> = {
    '1': [
      { id: '1', stopName: 'Quezon City Hall', latitude: 14.6514, longitude: 121.0509 },
      { id: '2', stopName: 'Kalayaan Ave. Cor. Masigla Street', latitude: 14.64433444753359, longitude: 121.05368593407127 },
      { id: '3', stopName: 'Kalayaan Ave. Cor. Kamias Road Interchange', latitude: 14.633268792854448, longitude: 121.05388752744793 },
      { id: '4', stopName: 'Barangay Silangan Hall', latitude: 14.628984319683413, longitude: 121.05615016957304 },
      { id: '5', stopName: '15th Ave / Yale Street Cor. Aurora Blvd', latitude: 14.624143560250321, longitude: 121.05528453165783 },
      { id: '6', stopName: 'Cubao Ali Mall', latitude: 14.623430032973733, longitude: 121.05566616374077 },
    ],
    '2': [
      { id: '1', stopName: 'Quezon City Hall', latitude: 14.6514, longitude: 121.0509 },
      { id: '2', stopName: 'Commonwealth Ave. (St. Peter Parish Church)', latitude: 14.681914853715025, longitude: 121.08526106903086 },
      { id: '3', stopName: 'IBP Road Maclang General Hospital', latitude: 14.68628352290432, longitude: 121.08906703558222 },
      { id: '4', stopName: 'IBP Road Quezon City University - Batasan Hills', latitude: 14.689322571026349, longitude: 121.0942671098347 },
      { id: '5', stopName: 'Litex / IBP Hall', latitude: 14.6760, longitude: 121.1000 },
    ],
    '3': [
      { id: '1', stopName: 'Welcome Rotonda Cor. E Rodriguez Sr. Ave', latitude: 14.617914663661258, longitude: 121.00213698374634 },
      { id: '2', stopName: 'E Rodriguez Sr. Ave Cor. Araneta Ave. Quezon Institute', latitude: 14.618879814465808, longitude: 121.01374605517098 },
      { id: '3', stopName: 'E Rodriguez Sr. Ave. St. Lukes / National Children’s Hospital', latitude: 14.620636413514221, longitude: 121.02058939385135 },
      { id: '4', stopName: 'E Rodriguez Sr. Ave. Cor. Gilmore Interchange', latitude: 14.623174995678864, longitude: 121.02903636815324 },
      { id: '5', stopName: 'Kamuning road Delgado Hospital (Kamuning Market)', latitude: 14.627895081980581, longitude: 121.03464416113617 },
      { id: '6', stopName: 'Kamuning road K-E Street', latitude: 14.630033207386793, longitude: 121.04302458019855 },
      { id: '7', stopName: 'Kamias road Edsa', latitude: 14.630886927793561, longitude: 121.04622846454505 },
      { id: '8', stopName: 'Kalayana Ave. Cor. Kamias Interchange', latitude: 14.633179808449706, longitude: 121.05388788508593 },
      { id: '9', stopName: 'Kamias road Cor Anonas', latitude: 14.634499091047815, longitude: 121.05874695637706 },
      { id: '10', stopName: 'Anonas road Chico Street', latitude: 14.632388235082528, longitude: 121.06017244923797 },
      { id: '11', stopName: 'Aurora blvd LRT 2 Anonas Station', latitude: 14.627915300638325, longitude: 121.06475134145627 },
      { id: '12', stopName: 'Aurora Blvd JP Rizal St', latitude: 14.629208792319545, longitude: 121.06926678477576 },
      { id: '13', stopName: 'Aurora blvd Cor. Katipunan Interchange', latitude: 14.631249921444319, longitude: 121.07260593356285 },
    ],
    '4': [
      { id: '1', stopName: 'QC Hall NHA Interchange', latitude: 14.648448404877666, longitude: 121.04985195739276 },
      { id: '2', stopName: 'North Ave Veterans Hospital / Vertis North', latitude: 14.65359768509694, longitude: 121.03952631776232 },
      { id: '3', stopName: 'Mindanao Ave Cor Road 1', latitude: 14.655487652100192, longitude: 121.03538652076975 },
      { id: '4', stopName: 'Mindanao Ave Cor Congressional Ave', latitude: 14.668336816518044, longitude: 121.03381961300053 },
      { id: '5', stopName: 'Mindanao Ave Cor. Tandang Sora Ave', latitude: 14.677370745958132, longitude: 121.03230741943025 },
      { id: '6', stopName: 'Mindanao Ave Cor. Sauyo road', latitude: 14.688049243426256, longitude: 121.03112369350421 },
      { id: '7', stopName: 'Mindanao Ave Cor. Quirino Highway', latitude: 14.690469835652866, longitude: 121.02815522294607 },
      { id: '8', stopName: 'QCU Main Campus', latitude: 14.699999225655494, longitude: 121.03457006938143 },
      { id: '9', stopName: 'SM Novaliches', latitude: 14.707837086244083, longitude: 121.03891762125674 },
      { id: '10', stopName: 'Foresthill Drives', latitude: 14.716235876119459, longitude: 121.04041698598485 },
      { id: '11', stopName: 'Gen Luis Novaliches Bayan', latitude: 14.721874992392632, longitude: 121.03892052384066 },
      { id: '12', stopName: 'Gen Luis Banahaw St.', latitude: 14.72054777954118, longitude: 121.02835419587072 },
      { id: '13', stopName: 'Gen Luis SB Road', latitude: 14.719500230758308, longitude: 121.02117756607956 },
    ],
  };
  

const selectStop = () => {
    const router = useRouter()
    const { routeId } = useLocalSearchParams()
    const stops = stopsData[routeId as string] || []

    const handleSelectStop = (stop: { id: string, stopName: string, latitude: number, longitude: number }) => {
        console.log(`Selected stop ID: ${stop.id}`)
        router.push({ 
            pathname: '/screens/routes/waitRoute[Id]', 
            params: { 
                routeId, 
                stopId: stop.id,
                latitude: stop.latitude.toString(),
                longitude: stop.longitude.toString()
            } 
        })
    }
    
    return (
        <View className="flex-1 bg-white">
          <BackButton />
          <View className="w-full h-32 bg-primary flex-row rounded-b-3xl items-center justify-center">
            <Image source={images.cityBusLogo} className="w-20 h-20" resizeMode="contain" />
            <Text className="text-3xl font-bold text-center text-white mr-10">Select Stop</Text>
          </View>
    
          <Text className='text-3xl text-black font-semibold text-center top-10'>What stop are you in?</Text>
          <View className="flex-1 px-5 mt-20">
            <FlatList
              data={stops}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 30 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelectStop(item)}
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
                    <Text className="text-lg font-semibold text-gray-800">{item.stopName}</Text>
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
}

export default selectStop