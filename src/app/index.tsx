import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { setApiAuth } from '../api/apiClient';
import { selectIsAuthenticated } from '../features/auth/authSelectors';
import { refreshToken } from '../features/auth/authSlice';
import { store } from '../store';
import { LoginScreen } from './screens/LoginScreen';

export default function Index(){
    setApiAuth(
  () => store.getState().auth.token, // get latest token dynamically
  async () => {
    const refresh = store.getState().auth.refreshToken;
    if (!refresh) throw new Error('No refresh token');

    const newTokens = await store.dispatch(refreshToken(refresh)).unwrap();
    return newTokens.authenticationToken;
  }
);
   const isAuthenticated = useSelector(selectIsAuthenticated)
   useEffect(() => {
    if (isAuthenticated) {
        router.replace('/(tabs)' as never);
    }
   }, [isAuthenticated])
   
    return (
   <Redirect href="/(auth)/login" />
    )
}
