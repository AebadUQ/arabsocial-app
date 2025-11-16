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
