import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/src/config/appConfig';
import { FetchApiClient } from '@/src/shared/api/apiClient';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const STORAGE_KEY = '@mos/fcm_token';
const mosApiClient = new FetchApiClient(API_BASE_URL);

async function getOrFetchDeviceToken(): Promise<string> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (stored) return stored;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') throw new Error('Bildirim izni verilmedi.');

  const { data: token } = await Notifications.getDevicePushTokenAsync();
  await AsyncStorage.setItem(STORAGE_KEY, token);
  return token;
}

export async function registerForPushNotifications(accessToken: string): Promise<void> {
  const token = await getOrFetchDeviceToken();
  const encodedToken = btoa(token);
  const deviceType = Platform.OS === 'ios' ? '1' : '0';

  await mosApiClient.request('/RegisterSNS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { token: encodedToken, deviceType },
  });
}
