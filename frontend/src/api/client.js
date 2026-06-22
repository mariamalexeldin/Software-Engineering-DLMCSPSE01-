import axios from "axios";

export const API_ROOT = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("findly_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem("findly_token")) {
      localStorage.removeItem("findly_token");
      localStorage.removeItem("findly_user");
      window.dispatchEvent(new Event("auth-expired"));
    }
    return Promise.reject(error);
  }
);

export function errorMessage(error) {
  return error.response?.data?.message || error.message || "Something went wrong";
}

export function imageUrl(path) {
  return path ? `${API_ROOT}${path}` : "";
}

export default api;

