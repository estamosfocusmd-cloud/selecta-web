import axios from 'axios';

const BASE = (import.meta.env.VITE_API_URL as string) || 'https://selecta-web.onrender.com';

export const api = axios.create({ baseURL: `${BASE}/api` });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('selecta_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('selecta_token');
      localStorage.removeItem('selecta_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const clientApi = axios.create({ baseURL: `${BASE}/api` });

clientApi.interceptors.request.use(config => {
  const token = sessionStorage.getItem('selecta_gallery_token');
  if (token) config.headers['x-gallery-token'] = token;
  return config;
});

export const getApiError = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error || err.message || 'Error desconocido';
  }
  return 'Error desconocido';
};
