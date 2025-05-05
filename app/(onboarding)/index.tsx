import { View, Image, Text, TouchableOpacity} from 'react-native'
import React from 'react'
import { images } from '@/constants/images';
import LinkButton from '@/components/LinkButton';

const index = () => {
  return (

    <View className='bg-primary flex-1 items-center justify-start'>
        <Image source={images.qcLogo} className='absolute mt-10 left-4 w-20 h-16'/>
        <Image source={images.qcBuzzerLogo} className='mt-52'/>

        <LinkButton href="/onboarding" label="Get Started" className="mt-52" />
    </View>


  )
}

export default index