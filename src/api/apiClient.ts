// src/services/api.ts
import axios from 'axios';
import Constants from 'expo-constants';
import { store } from '../app/store';
import { logout, refreshToken } from '../features/auth/authSlice';

const api = axios.create({
  baseURL: Constants.expoConfig?.extra?.API_URL, // or http://localhost:8080 if local
});

// Attach access token before requests
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors -> refresh automatically
let isRefreshing = false;
let queue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken: refresh } = store.getState().auth;
      if (!refresh) {
        store.dispatch(logout());
        return Promise.reject(error);
      }

      try {
        const response = await store.dispatch(refreshToken(refresh)).unwrap();
        processQueue(null, response.authenticationToken);

        originalRequest.headers['Authorization'] = `Bearer ${response.authenticationToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        store.dispatch(logout());
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
