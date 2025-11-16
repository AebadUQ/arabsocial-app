import { Asset } from 'react-native-image-picker';
import api from './api';

// ✅ Get approved and upcoming events
export const getApprovedEvents = async (params: {
  when?: string;
  page?: number;
  limit?: number;
  country?: string;
  city?: string;
}) => {
  const { when = 'all', page = 1, limit = 10, country, city } = params;

  const queryParams = new URLSearchParams({
    when,
    page: String(page),
    limit: String(limit),
    ...(country ? { country } : {}),
    ...(city ? { city } : {}),
  }).toString();
console.log("queryParams",queryParams)
  const response = await api.get(`/events/approved-events?${queryParams}`);
  return response.data;
};
export const getAllMyEvents= async (params: {
  page?: number;
  limit?: number;
  search?: string;
} = {}) => {
  const { page = 1, limit = 10, search } = params;

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search ? { search } : {}),
  }).toString();

  console.log("queryParams", queryParams);
  const response = await api.get(`/events/my-events?${queryParams}`);
  console.log("responseresponseresponse",response.data)

  return response.data;
};
// ✅ Create a new event
export const createEvent = async (data: any) => {
  const response = await api.post('/events/create-event', data);
  return response.data;
};

// ✅ Register or unregister for an event
export const toggleEventRegistration = async (data: {
  eventId: number;
  register: boolean;
}) => {
  const response = await api.post('/events/register-event', data);
  return response.data;
};

// ✅ Save or unsave an event
export const toggleSaveEvent = async (data: { eventId: number }) => {
  const response = await api.post('/events/events-save', data);
  return response.data;
};

// ✅ Get saved events
export const getSavedEvents = async () => {
  const response = await api.get('/events/saved-events');
  return response.data;
};
export const getEventsDetail= async (id:any) => {
  const response = await api.get(`/events/${id}`);
  return response.data.data;
};
export const updateEvent=async (
  id: string | number,
  data: Record<string, any> | FormData
)=>{
    const response = await api.patch(`/events/${id}`,data);
    return response.data.data
}

export const uploadEventImage = async (image: Asset) => {
  const formData = new FormData();

  formData.append("file", {
    // @ts-ignore
    uri: image.uri,
    name: image.fileName || `event-${Date.now()}.jpg`,
    type: image.type || "image/jpeg",
  });

  const response = await api.post("/upload/image/event", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // backend se aa raha:
  // { "url": "https://storage.googleapis.com/..." }
  return response.data as { url: string };
};

export const deleteEvent = async (
  id: any) => {
  const res = await api.delete(`/events/${id}`); // 👈 plural
  return res.data?.data ?? res.data;
};