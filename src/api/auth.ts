import api from './api';
import { LoginPayload, RegisterPayload } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const registerUser = async (data: RegisterPayload) => {
  const response = await api.post('/users/signup', data);
  return response.data;
};
export const loginUser = async (data: LoginPayload) => {
  const response = await api.post('/users/login', data);

  const token = response.data?.accessToken;
  if (token) {
    await AsyncStorage.setItem('authToken', token); // ✅ Save token
  }

  return response.data;
};
export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data.data;
};