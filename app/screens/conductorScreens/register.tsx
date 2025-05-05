import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { images } from '@/constants/images';
import BackButton from '@/components/BackButton';
import { supabase } from '@/service/supabaseClient';
import * as Crypto from 'expo-crypto';  // Import expo-crypto

export default function Register() {
  const router = useRouter(); // Use useRouter() from expo-router
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    busCode: '',
    operatorName: '',
    contactNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleRegister = async () => {
    // Form validation
    if (
      !form.busCode ||
      !form.operatorName ||
      !form.contactNumber ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      alert('Please fill in all fields');
      return;
    }
  
    // Password matching check
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
  
    // Email validation
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(form.email)) {
      alert('Please enter a valid email address.');
      return;
    }
  
    try {
      // Hash the password using expo-crypto
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        form.password
      );
  
      console.log('Hashed Password:', hashedPassword); // Log hashed password
  
      // Insert into Supabase
      const { data, error } = await supabase.from('bus_accounts').insert({
        bus_code: form.busCode,
        operator_name: form.operatorName,
        contact_number: form.contactNumber,
        email: form.email,
        password: hashedPassword,
      }).select(); // Explicitly requesting the inserted data
  
      if (error) {
        console.error('❌ Supabase insert error:', error.message, error.details, error.hint);
        alert(`Error: ${error.message}`);
      } else {
        console.log('✅ Bus registered successfully:', data);
        alert('Bus registered successfully');
        router.push('/screens/conductorScreens/login'); // Redirect to login after successful registration
      }
    } catch (e) {
      console.error('❌ Unexpected error:', e);
      alert('Unexpected error occurred. Please try again later.');
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
          <Text className="relative text-white font-bold text-3xl mb-6">
            Register your Bus
          </Text>

          {/* Input Fields */}
          <TextInput
            className="bg-white rounded-lg px-4 py-3 w-full mb-3"
            placeholder="Bus Code"
            value={form.busCode}
            onChangeText={(text) => handleChange('busCode', text)}
          />
          <TextInput
            className="bg-white rounded-lg px-4 py-3 w-full mb-3"
            placeholder="Operator Name"
            value={form.operatorName}
            onChangeText={(text) => handleChange('operatorName', text)}
          />
          <TextInput
            className="bg-white rounded-lg px-4 py-3 w-full mb-3"
            placeholder="Contact Number"
            keyboardType="phone-pad"
            value={form.contactNumber}
            onChangeText={(text) => handleChange('contactNumber', text)}
          />
          <TextInput
            className="bg-white rounded-lg px-4 py-3 w-full mb-3"
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(text) => handleChange('email', text)}
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

          {/* Confirm Password */}
          <View className="bg-white rounded-lg px-4 py-3 w-full mb-6 flex-row items-center">
            <TextInput
              className="flex-1"
              placeholder="Confirm Password"
              secureTextEntry={!showConfirmPassword}
              value={form.confirmPassword}
              onChangeText={(text) => handleChange('confirmPassword', text)}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </TouchableOpacity>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            className="bg-blue-800 w-full py-3 rounded-full"
            onPress={handleRegister}
          >
            <Text className="text-white text-center text-lg font-semibold">Register</Text>
          </TouchableOpacity>

          {/* Go to Login */}
          <TouchableOpacity
            onPress={() => router.push('/screens/conductorScreens/login')} // Use router.push() for navigation
            className="mt-4"
          >
            <Text className="text-white">Already registered the bus? Login here.</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
