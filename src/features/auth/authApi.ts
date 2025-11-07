import axios from 'axios';
import Constants from 'expo-constants';
import { AuthResponse, Credentials, SignUpRequest } from './authTypes';

const API_URL = `${Constants.expoConfig?.extra?.API_URL}/api/v1/auth-service`; // put this in constants/env later
export const loginRequest = async (credentials: Credentials): Promise<AuthResponse> => {
console.log('API_URL:', API_URL);

  const response = await axios.post<AuthResponse>(`${API_URL}/authenticate`, credentials, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

export const signUpRequest = async (request: SignUpRequest): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>(
      `${API_URL}/register`, 
      request, 
      { headers: { 'Content-Type': 'application/json' }})
    return response.data;
}

export const refreshTokenRequest = async (refreshToken: string): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(
    `${API_URL}/refresh-token`, 
    { token: refreshToken }, 
    { headers: { 'Content-Type': 'application/json' }}
  );
  return response.data;
}