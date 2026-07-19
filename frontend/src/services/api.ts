import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const guestUuid = localStorage.getItem('guest_uuid');
  if (guestUuid) {
    config.headers['X-Guest-UUID'] = guestUuid;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAiEndpoint = error.config?.url?.includes('/ai/');
      if (isAiEndpoint) {
        const newUuid = crypto.randomUUID();
        localStorage.setItem('guest_uuid', newUuid);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
