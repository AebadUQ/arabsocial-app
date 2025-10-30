import api from './api';
export const getAllPost = async (params: {
  page?: number;
  limit?: number;
}) => {
  const {page = 1, limit = 10 } = params;

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  }).toString();
  const response = await api.get(`/posts/feed?${queryParams}`);
  console.log("rassds",response.data)
  return response.data.data;
};

export const getPostComments = async (params: {
  postId: number | string;
  page?: number;
  limit?: number;
}): Promise<any> => {
  const { postId, page = 1, limit = 10 } = params;
  const query = new URLSearchParams({ page: String(page), limit: String(limit) }).toString();
  const res = await api.get(`/posts/comments/${postId}?${query}`);

  // Expecting same wrapper: { success, message, data: { data: [...], meta: {...} } }
  const payload = res.data?.data ?? {};
  return {
    data: payload.data ?? [],
    meta: payload.meta ?? { total: 0, page, lastPage: 1 },
  };
};
export const addPostComment = async ({ postId, content }: { postId: number | string; content: string; }) => {
  const res = await api.post(`/posts/comments/${postId}`, { content });
  return res.data?.data; // server ka created comment object
};