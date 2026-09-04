import axios from 'axios';

// URL del backend. En desarrollo apunta a localhost:4000 (donde corre nuestro servidor Express).
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
});

// Antes de cada petición, si hay un token de admin guardado, lo mandamos automáticamente.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('beautycare_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
