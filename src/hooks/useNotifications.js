import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

// Configurar cómo se muestran las notificaciones cuando la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const useNotifications = (userId) => {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    if (!userId) return;

    registerForPushNotificationsAsync(userId);

    // Escuchar cuando llega una notificación
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida:', notification);
    });

    // Escuchar cuando el usuario toca una notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notificación tocada:', response);
      // Aquí puedes navegar a una pantalla específica
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [userId]);

  return;
};

async function registerForPushNotificationsAsync(userId) {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('No se obtuvieron permisos para notificaciones');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);
    
    // Guardar token en Supabase
    if (token && userId) {
      await savePushToken(userId, token);
    }
  } else {
    console.log('Debes usar un dispositivo físico para notificaciones push');
  }

  return token;
}

async function savePushToken(userId, token) {
  try {
    // Verificar si ya existe el token
    const { data: existing } = await supabase
      .from('push_tokens')
      .select('id')
      .eq('user_id', userId)
      .eq('token', token)
      .maybeSingle();

    if (existing) {
      console.log('Token ya existe');
      return;
    }

    // Insertar nuevo token
    const { error } = await supabase
      .from('push_tokens')
      .insert({
        user_id: userId,
        token: token,
      });

    if (error) throw error;
    console.log('Token guardado correctamente');
  } catch (error) {
    console.log('Error al guardar token:', error);
  }
}