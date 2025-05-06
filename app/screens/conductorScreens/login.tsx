import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { images } from '@/constants/images';
import BackButton from '@/components/BackButton';
import { useRouter } from 'expo-router';
import { loginBus } from '@/service/authService';
import * as Crypto from 'expo-crypto'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/service/supabaseClient'; 

export default function Login() {
  const router = useRouter();  // Use the useRouter hook for navigation
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    busCode: '',
    password: '',
  });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleLogin = async () => {
    // form validation
    if (!form.busCode || !form.password) {
      alert('Please fill in all fields');
      return;
    }
  
    try {
      // hashing the entered password using expo-crypto
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        form.password
      );
  
      // query Supabase to find the bus account based on busCode
      const { data, error } = await supabase
        .from('bus_accounts')
        .select('*')
        .eq('bus_code', form.busCode)
        .single();
  
      if (error) {
        console.error('❌ Supabase query error:', error.message);
        alert('Error fetching bus account. Please try again later.');
        return;
      }
  
      // check if the hashed password matches the one in the database
      if (data && data.password === hashedPassword) {
        console.log('Login successful:', data);
        alert('Login successful!');
        router.push('/screens/conductorScreens/status');
        await AsyncStorage.setItem('busAccount', JSON.stringify(data));
      } else {
        alert('Incorrect bus code or password');
      }
    } catch (error) {
      console.error('❌ Error logging in:', error);
      alert('An error occurred. Please try again later.');
    }
  };
  

  return (
    <View className="flex-1 bg-blue-600 items-center justify-center px-6">
      <BackButton />
      {/* Logo */}
      <Image
        source={images.qcLogo}
        className="absolute top-12 right-6 w-20 h-20"
        resizeMode="contain"
      />

      <View className="flex-1 items-center justify-center w-full px-16 gap-20">
        <Image source={images.qcBuzzerLogo} />

        <View className="items-center justify-center w-full gap-2">
          <Text className="relative text-white right-17 font-bold text-3xl mb-6">
            Bus Login
          </Text>

          {/* Input Fields */}
          <TextInput
            className="bg-white rounded-lg px-4 py-3 w-full mb-3"
            placeholder="Bus Code"
            value={form.busCode}
            onChangeText={(text) => handleChange('busCode', text)}
          />

          {/* Password */}
          <View className="bg-white rounded-lg px-4 py-3 w-full mb-3 flex-row items-center">
            <TextInput
              className="flex-1"
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={form.password}
              onChangeText={(text) => handleChange('password', text)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} color="gray" /> : <Eye size={20} />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="bg-blue-800 w-full py-3 rounded-full"
            onPress={handleLogin}
          >
            <Text className="text-white text-center text-lg font-semibold">Login</Text>
          </TouchableOpacity>

          {/* Register Link using useRouter for navigation */}
          <TouchableOpacity
            className="mt-4"
            onPress={() => router.push('/screens/conductorScreens/register')}  // Use router.push() for navigation
          >
            <Text className="text-white">Bus not registered yet? Register here.</Text>
          </TouchableOpacity>
        </View>
      </View>
  </View>
  );
}
