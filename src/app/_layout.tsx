import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { getPersistor, store } from '../store';

const queryClient = new QueryClient();

export default function RootLayout() {
  const [persistor, setPersistor] = useState<any>(null);

  useEffect(() => {
    setPersistor(getPersistor());
  }, []);

  if (!persistor) return null; // wait for client

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <Stack
            screenOptions={{
              headerShown: false
            }}
          />
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}