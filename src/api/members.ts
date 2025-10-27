import api from './api';

interface GetAllUsersParams {
  page?: number;
  limit?: number;
  search?: string;      // optional: search by name/email
  status?: string;      // optional: filter by connection status (connected, pending, etc)
  role?: string;        // optional: filter by role
}

// ✅ Get all users with connection status
export const getAllUsersWithConnectionStatus = async (params: GetAllUsersParams) => {
  const { page = 1, limit = 10, search, status, role } = params;

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
    ...(role ? { role } : {}),
  }).toString();

  console.log('getAllUsersWithConnectionStatus queryParams', queryParams);

  const response = await api.get(`/users/all-users-with-connection-status?${queryParams}`);
  
  console.log("response",response)
  return response.data;
};

// ✅ Get connected users
export const getConnectedUsers = async (params: { page?: number; limit?: number }) => {
  const { page = 1, limit = 10 } = params;

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  }).toString();

  console.log('getConnectedUsers queryParams', queryParams);

  const response = await api.get(`/users/connected-users?${queryParams}`);
  console.log("r",response.data)
  return response.data;
};

// ✅ Get pending connection requests
export const getPendingConnectionRequests = async (params: { page?: number; limit?: number }) => {
  const { page = 1, limit = 10 } = params;

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  }).toString();

  console.log('getPendingConnectionRequests queryParams', queryParams);

  const response = await api.get(`/users/connection-requests/pending?${queryParams}`);
 
 console.log("p",response.data.data)
  return response.data;
};
export const respondToConnectionRequest = async (requestId: number, status: "accepted" | "rejected") => {
  const response = await api.patch(`/users/connection-requests/respond/${requestId}`, {
    status,
  });
  return response.data;
};
export const sendConnectionRequest = async (receiverId: number) => {

    const response = await api.post(`/users/connect`,{
    receiverId
  });
  return response.data;
};