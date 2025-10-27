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
