import { Stack } from 'expo-router';
import './globals.css';
import { StatusBar } from 'react-native';

export default function RootLayout() {
  return (
    <>
      <StatusBar hidden={true} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(onboarding)/index" />
        <Stack.Screen name="(onboarding)/onboarding" />
        <Stack.Screen name="(onboarding)/roleSelect" />
        <Stack.Screen name="screens/actionSelect" />
        <Stack.Screen name="screens/checkRouteList" />
        <Stack.Screen name="screens/waitRouteList" />
        <Stack.Screen name="screens/routes/checkRoute[Id]" />
        <Stack.Screen name="screens/selectStop" />
        <Stack.Screen name="screens/routes/waitRoute[Id]" />
        <Stack.Screen name="screens/conductorScreens/register" />
        <Stack.Screen name="screens/conductorScreens/login" />
      </Stack>
    </>
  );
}
