import axios from "axios";

// One shared axios instance so we don't repeat the base URL everywhere.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// This runs before EVERY request: it grabs the saved token from
// localStorage and attaches it as "Bearer <token>" automatically,
// so we never have to manually add it in each component.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
