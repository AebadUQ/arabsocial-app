import api from "./api";
export const getAllMyChatRooms = async (params: {
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

  const response = await api.get(`/chat/rooms?${queryParams}`);

  console.log("All my chat rooms:", response.data);

  return response.data.data; // backend format match
};
export const getChatRoomMessage = async (
  roomId: number,
  params?: { page?: number; limit?: number }
) => {
  const { page = 1, limit = 20 } = params || {};

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  }).toString();

  const response = await api.get(`/chat/messages/${roomId}?${queryParams}`);

  console.log("Chat room messages:", response.data);

  return response.data?.data; // exact backend format
};
export const getAllChatUsers = async (params: {
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

  const response = await api.get(`/chat/users?${queryParams}`);

  console.log("All chat users:", response.data);

  return response.data.data; // Adjust based on backend response
};
export const initialChat = async (data: {
  user2Id: number;
}) => {
  const response = await api.post('/chat/room/create', data);
  return response.data;
};