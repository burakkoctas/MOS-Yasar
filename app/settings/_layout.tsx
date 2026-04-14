import { DelegateProvider } from '@/src/features/delegate/context/DelegateContext';
import { Stack } from 'expo-router';

export default function DelegateLayout() {
  return (
    <DelegateProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </DelegateProvider>
  );
}