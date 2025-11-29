import { Asset } from 'react-native-image-picker';
import api from './api';
import { LoginPayload, RegisterPayload } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const registerUser = async (data: RegisterPayload) => {
  const response = await api.post('/users/signup', data);
  return response.data;
};
export const loginUser = async (data: LoginPayload) => {
  const response = await api.post('/users/login', data);
console.log("asss",response.data.data)
  const token = response.data?.data?.accessToken;
  if (token) {
    await AsyncStorage.setItem('authToken', token); // ✅ Save token
  }

  return response.data.data;
};
export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data.data;
};
export const editUserProfile = async (data:any) => {
  const response = await api.put('/users/update-user',data);
  return response.data.data;
};

export const updateUserDetailVisibility = async (data:any) => {
    console.log("payload",data)
  const response = await api.patch('/users/update-visibility',data);
  return response.data.data;
};

export const getPublicUserProfile = async (id:number) => {
  const response = await api.get(`/users/user-public-profile/${id}`);
  return response.data.data;
};

export const uploadProfileImage = async (image: Asset) => {
  const formData = new FormData();

  formData.append("file", {
    // @ts-ignore
    uri: image.uri,
    name: image.fileName || `user-${Date.now()}.jpg`,
    type: image.type || "image/jpeg",
  });

  const response = await api.post("/upload/image/user", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // backend se aa raha:
  // { "url": "https://storage.googleapis.com/..." }
  return response.data as { url: string };
};
export const verifyOtp = async (data: { email: string; otp: string }) => {
  const response = await api.post('/users/verify-otp', data);

  const token = response.data?.data?.accessToken;
  if (token) {
    await AsyncStorage.setItem('authToken', token); // save token
  }

  return response.data.data; // return same structure as login
};

export const forgotPassword = async (email: string) => {
  const response = await api.post('/users/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (data: {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const response = await api.post('/users/reset-password', data);
  return response.data;
};
export const resendVerificationOtp = async (email: string) => {
  const response = await api.post("/users/resend-otp", { email });
  return response.data;
};

export const resendForgotPassOtp = async (email: string) => {
  const response = await api.post("/users/forgot-password/resend-otp", { email });
  return response.data;
};