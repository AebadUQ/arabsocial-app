import { Asset } from "react-native-image-picker";
import api from "./api";
export const getAllGroups = async (params: {
  page?: number;
  limit?: number;
    search?: string;

}) => {
  const { page = 1, limit = 10, search = "" } = params;

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
        search: search.trim(),

  }).toString();

  const response = await api.get(`/group?${queryParams}`);


  return response.data.data; // backend format match
};
export const getAllMyGroups = async (params: {
  page?: number;
  limit?: number;
    search?: string;

}) => {
  const { page = 1, limit = 10, search = "" } = params;

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
        search: search.trim(),

  }).toString();

  const response = await api.get(`/group/my-groups?${queryParams}`);


  return response.data.data; // backend format match
};

export const requestToJoin = async (  groupId: number ) => {


    console.log("groupId",groupId)
  const response = await api.post(`/group/${groupId}/join`);
  return response.data;
};

export const createGroup = async (  data: any ) => {


  const response = await api.post(`/group/create`,data);
  return response.data;
};
export const uploadGroupImage = async (image: Asset) => {
  const formData = new FormData();

  formData.append("file", {
    // @ts-ignore
    uri: image.uri,
    name: image.fileName || `post-${Date.now()}.jpg`,
    type: image.type || "image/jpeg",
  });

  const response = await api.post("/upload/image/group", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data as { url: string };
};
export const getGroupMessages = async (
  groupId: number,
  params?: { page?: number; limit?: number }
) => {
  const { page = 1, limit = 20 } = params || {};

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  }).toString();

  const response = await api.get(`/group/messages/${groupId}?${queryParams}`);

  console.log("Chat room messages:", response.data);

  return response.data?.data; // exact backend format
};
export const getGroupDetail= async (id:any) => {
  const response = await api.get(`/group/details/${id}`);
  console.log("response",JSON.stringify(response?.data.data))
  return response.data.data;
};
export const getGroupMembers = async (
  groupId: number,
  params?: { page?: number; limit?: number }
) => {
  const { page = 1, limit = 20 } = params || {};

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  }).toString();

  const response = await api.get(`/group/members/${groupId}?${queryParams}`);


  return response.data?.data; // exact backend format
};

export const getGroupMembersPendingRequest = async (
  groupId: number,
  params?: { page?: number; limit?: number }
) => {
  const { page = 1, limit = 20 } = params || {};

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  }).toString();

  const response = await api.get(`/group/requests/${groupId}?${queryParams}`);


  return response.data?.data; // exact backend format
};
export const acceptRequest = async (requestId: string) => {
  try {
    const response = await api.post(`/group/request/${requestId}/accept`);
    return response.data;
  } catch (error) {
    console.error("Error accepting request:", error);
    throw error;
  }
};

// Reject request with groupId
export const rejectRequest = async (groupId: string) => {
  try {
    const response = await api.post(`/group/request/${groupId}/reject`);
    return response.data;
  } catch (error) {
    console.error("Error rejecting request:", error);
    throw error;
  }
};