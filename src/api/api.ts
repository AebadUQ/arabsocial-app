// api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.18.29:3000',
    // baseURL: 'https://arabsocials.duckdns.org', // HTTP, no port

  timeout: 10000,
});

export const setupInterceptors = (logout: () => void) => {
  // ✅ Request interceptor
  api.interceptors.request.use(
    async (config) => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  // ✅ Response interceptor
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.status === 401) {
        // Unauthorized → Logout user
        console.log('401 Unauthorized → logging out');
        logout(); // Context me logout call
      }

      // Original error handling
      if (error.response && error.response.data) {
        const data = error.response.data;
        let message = 'Something went wrong';
        if (typeof data.message === 'string') message = data.message;
        else if (Array.isArray(data.message)) message = data.message.join(', ');
        else if (typeof data.error === 'string') message = data.error;
        return Promise.reject(new Error(message));
      } else if (error.message) {
        return Promise.reject(new Error(error.message));
      }

      return Promise.reject(new Error('An unknown error occurred'));
    }
  );
};

export default api;
