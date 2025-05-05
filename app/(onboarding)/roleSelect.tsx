import { View, Image, Text, TouchableOpacity} from 'react-native'
import React from 'react'
import { images } from '@/constants/images';
import LinkButton from '@/components/LinkButton';

const roleSelect = () => {
  return (
    <View className='bg-primary flex-1 items-center justify-start border-b-8'>
            <Image source={images.qcBuzzerLogo} className='mt-52'/>
            <Text className='text-center text-white text-3xl font-semibold mt-24 '>Are you a...</Text>
            <View className='flex-col gap-5 mt-44'>
              <LinkButton href="../screens/actionSelect" label="COMMUTER?" />
              <LinkButton href="/screens/conductorScreens/login" label="CONDUCTOR?" />
            </View>
    </View>
  )
}

export default roleSelect