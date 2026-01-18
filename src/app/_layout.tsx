import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { setApiAuth } from '../api/apiClient';
import AuthGate from '../components/AuthGate';
import { logout, refreshToken } from '../features/auth/authSlice';
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
      <PersistGate loading={null} persistor={persistor}
              onBeforeLift={() => {
          setApiAuth(
            () => store.getState().auth.token,
            async () => {
              const refresh = store.getState().auth.refreshToken;
              if (!refresh) throw new Error('No refresh token');

              const res = await store.dispatch(refreshToken(refresh)).unwrap();
              return res.authenticationToken;
            },
            () => store.dispatch(logout())
          );
        }}
      >
        <QueryClientProvider client={queryClient}>
        <AuthGate>
          <Stack
            screenOptions={{headerShown: false}}
          />
          </AuthGate>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}