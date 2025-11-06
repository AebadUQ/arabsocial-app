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
export const updateBusiness=async (
  id: string | number,
  data: Record<string, any> | FormData
)=>{
    const response = await api.put(`/business/${id}`,data);
    return response.data.data
}

export const getAllMyBusiness = async (params: {
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

  const response = await api.get(`/business/my-business?${queryParams}`);
  return response.data;
};
export const getAllFeaturedBusinesses = async (params: {
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

  const response = await api.get(`/business/featured-businesses?${queryParams}`);
  return response.data;
};

export const createJobs = async (data: any) => {
  const response = await api.post('/business/create-job', data);
  return response.data;
};

export const getJobDetails= async (id:any) => {
  const response = await api.get(`/business/job/${id}`);
  return response.data.data;
};

export const updateJob=async (
  id: string | number,
  data: Record<string, any> | FormData
)=>{
    const response = await api.patch(`/business/edit-job/${id}`,data);
    return response.data
}