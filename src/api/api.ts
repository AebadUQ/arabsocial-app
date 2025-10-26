import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://arabsocials.duckdns.org', // HTTP, no port
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
    (error) => {
      console.log('Axios Request Error:', error);
      return Promise.reject(error);
    }
  );

  // ✅ Response interceptor
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // Log full error object
      console.log('Axios Response Error:', error);

      if (error?.status === 401) {
        console.log('401 Unauthorized → logging out');
        logout();
      }

      if (error.response && error.response.data) {
        const data = error.response.data;
        let message = 'Something went wrong';
        if (typeof data.message === 'string') message = data.message;
        else if (Array.isArray(data.message)) message = data.message.join(', ');
        else if (typeof data.error === 'string') message = data.error;

        console.log('API Error Message:', message);
        return Promise.reject(new Error(message));
      } else if (error.message) {
        console.log('API Error Message:', error.message);
        return Promise.reject(new Error(error.message));
      }

      console.log('API Unknown Error:', error);
      return Promise.reject(new Error('An unknown error occurred'));
    }
  );
};

export default api;
