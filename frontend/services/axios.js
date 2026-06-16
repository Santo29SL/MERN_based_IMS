import axios from "axios";

let baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

if (baseURL && !baseURL.endsWith("/api") && !baseURL.endsWith("/api/")) {
  baseURL = baseURL.replace(/\/$/, "") + "/api";
}

const API = axios.create({
  baseURL
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
