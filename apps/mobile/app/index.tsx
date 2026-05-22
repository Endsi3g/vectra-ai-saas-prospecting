import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#3b82f6" />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? '/(tabs)' : '/auth/sign-in'} />;
}
