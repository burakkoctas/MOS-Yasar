// Path: app/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // Uygulama açılır açılmaz doğrudan Login ekranına yönlendirir
  return <Redirect href="/login" />;
}