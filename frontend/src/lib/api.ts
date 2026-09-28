// Central place for both backend URLs + the auth header, so they aren't
// hardcoded in three different components anymore.
import axios from "axios";

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "https://second-brain-backend-p1hj.onrender.com";

export const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || "http://127.0.0.1:8000";

export function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const backend = axios.create({ baseURL: `${BACKEND_URL}/api/v1` });
export const aiService = axios.create({ baseURL: AI_SERVICE_URL });

// Attach the token to every request automatically instead of passing headers
// by hand at every call site.
for (const client of [backend, aiService]) {
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
}
