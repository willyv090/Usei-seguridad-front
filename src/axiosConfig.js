import axios from 'axios';

// Instancia pública (sin token)
const publicAxios = axios.create();

// Instancia protegida (con token si existe)
const protectedAxios = axios.create();

protectedAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // ✅ tu key real
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export { publicAxios, protectedAxios };
