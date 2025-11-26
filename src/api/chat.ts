import api from "./api";
export const getAllMyChatRooms = async (params: {
  page?: number;
  limit?: number;
}) => {
  const { page = 1, limit = 10 } = params;

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
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
