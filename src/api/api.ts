import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://192.168.18.119:3000',
  timeout: 10000,
});

// ✅ Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    console.log("token",token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data) {
      const data = error.response.data;
      let message = 'Something went wrong';

      if (typeof data.message === 'string') {
        message = data.message;
      } else if (Array.isArray(data.message)) {
        message = data.message.join(', ');
      } else if (typeof data.error === 'string') {
        message = data.error;
      }

      return Promise.reject(new Error(message));
    } else if (error.message) {
      return Promise.reject(new Error(error.message));
    }

    return Promise.reject(new Error('An unknown error occurred'));
  }
);

export default api;
