import { View, Image, Text } from 'react-native'
import React from 'react'
import { images } from '@/constants/images'
import LinkButton from '@/components/LinkButton'
import BackButton from '@/components/BackButton'

const actionSelect = () => {
  return (
    <View className='bg-white flex-1 items-center justify-start'>
      <BackButton />
        <Image source={images.qcBuzzerLogoDark} className='w-30 h-10 mt-10' resizeMode='contain' />
        <View className='flex-col gap-4 justify-center items-center mt-14'>  
          <Text className='text-2xl font-semibold text-center'>Hello Commuter!</Text>
          <Text className='text-lg  text-center px-10'>What do you want to do?</Text>
        </View>

        <View className='flex-col gap-5 mt-44'>
          <LinkButton href="screens/checkRouteList" label="CHECK ROUTES" />
          <LinkButton href="screens/waitRouteList" label="WAIT IN-LINE" />
        </View>
    </View>
  )
}

export default actionSelect