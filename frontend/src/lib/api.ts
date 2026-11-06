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

for (const client of [backend, aiService]) {
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
}

for (const client of [backend, aiService]) {
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401 && localStorage.getItem("token")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (window.location.pathname !== "/") window.location.assign("/");
      }
      return Promise.reject(error);
    }
  );
}

export function signOut() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch {
    
  }
}

export interface StoredUser {
  id?: number;
  username: string;
  email: string;
}

export function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.email === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: StoredUser) {
  try {
    localStorage.setItem("user", JSON.stringify(user));
  } catch {
    
  }
}

export function isSignedIn() {
  try {
    return !!localStorage.getItem("token");
  } catch {
    return false;
  }
}
