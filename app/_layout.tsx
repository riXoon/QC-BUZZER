import { Stack } from 'expo-router';
import './globals.css';
import { StatusBar } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, 
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    // Request notification permissions
    const askForNotificationPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        console.log('Notification permissions granted!');
      } else {
        console.log('Notification permissions denied');
      }
    };
    askForNotificationPermissions();

    const notificationReceivedListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received while app is in foreground:', notification);
    });

    const notificationResponseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('User clicked on the notification:', response);
    });

  
    return () => {
      notificationReceivedListener.remove();
      notificationResponseListener.remove();
    };
  }, []);

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
