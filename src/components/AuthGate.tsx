import { RootState } from '@/src/store';
import { Redirect } from 'expo-router';
import { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSelector } from 'react-redux';

export default function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useSelector((state: RootState) => state.auth);

  // Auth still restoring (PersistGate + async restore)
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Not authenticated
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Auth ready
  return <>{children}</>;
}
