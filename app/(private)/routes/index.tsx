import { RoutesList } from '@/src/ui/routes/RoutesList';
import { Stack } from 'expo-router';

export default function RoutesScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <RoutesList />
    </>
  );
}

