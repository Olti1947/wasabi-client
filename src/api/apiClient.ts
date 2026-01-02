import axios from 'axios';
import Constants from 'expo-constants';
import { logout } from '../features/auth/authSlice';

type TokenProvider = () => string | null;
type RefreshHandler = () => Promise<string>;

let getToken: TokenProvider;
let onRefresh: RefreshHandler;

export const setApiAuth = (tokenProvider: TokenProvider, refreshHandler: RefreshHandler) => {
  getToken = tokenProvider;
  onRefresh = refreshHandler;
};

const api = axios.create({
  baseURL: Constants.expoConfig?.extra?.API_URL,
});

// Attach access token before requests
api.interceptors.request.use(
  (config) => {
    const token = getToken?.();
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
    if ((error.response?.status === 403 || error.response?.status === 401
    ) && !originalRequest._retry) {
      if (!onRefresh) {
        return Promise.reject(error);
      }

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

      try {
        const newToken = await onRefresh();
        processQueue(null, newToken);

        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        logout(); // optional: dispatch logout outside if you want
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
