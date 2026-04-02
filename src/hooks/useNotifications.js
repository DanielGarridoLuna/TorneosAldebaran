// hooks/useNotifications.js
import { useState, useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function useNotifications(playerId) {
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();

  async function registerForPushNotificationsAsync() {
    let token;
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (!Device.isDevice) {
      Alert.alert('Error', 'Las notificaciones solo funcionan en dispositivos físicos');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert('Error', 'No se pudieron obtener permisos para notificaciones');
      return null;
    }
    
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) throw new Error('Project ID not found');
      
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Expo Push Token:', token);
    } catch (error) {
      console.error('Error getting push token:', error);
    }

    return token;
  }

  async function savePushTokenToSupabase(token, pId) {
    if (!token || !pId) return;
    
    const { error } = await supabase
      .from('push_tokens')
      .upsert({
        player_id: pId,
        expo_push_token: token,
        device_os: Platform.OS,
        updated_at: new Date(),
      }, { onConflict: 'player_id' });
    
    if (error) console.error('Error saving push token:', error);
  }

  useEffect(() => {
    async function setupNotifications() {
      if (!playerId) return;
      
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await savePushTokenToSupabase(token, playerId);
        setExpoPushToken(token);
      }
    }

    setupNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      // Navegar según el tipo de notificación
      if (data.type === 'new_match' || data.type === 'result_confirmed') {
        // Navegar a la pantalla de partidas
        // navigation.navigate('MisPartidas');
      } else if (data.type === 'standings') {
        // Navegar a standings
        // navigation.navigate('Standings');
      }
    });

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, [playerId]);

  return { expoPushToken };
}