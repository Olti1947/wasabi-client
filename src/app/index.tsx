import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSelectors';

export default function Index(){
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
