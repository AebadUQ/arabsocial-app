import api from './api';
export const createBusiness = async (data: any) => {
  const response = await api.post('/business/create', data);
  return response.data;
};
export const getAllApprovedBusiness = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  categories?: string; // <-- single string only
} = {}) => {
  const { page = 1, limit = 10, search, categories } = params;

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search ? { search } : {}),
    ...(categories ? { categories } : {}),
  }).toString();

  console.log("queryParams", queryParams);

  const response = await api.get(`/business/approved-businesses?${queryParams}`);
  return response.data;
};
export const getBusinessDetail= async (id:any) => {
  const response = await api.get(`/business/${id}`);
  return response.data.data;
};
