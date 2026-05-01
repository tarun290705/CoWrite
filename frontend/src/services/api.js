import axios from "axios";
import dotenv from "dotenv";

const API = axios.create({
  // baseURL: import.meta.env.VITE_BACKEND_URI || "http://127.0.0.1:8000/api/",
  baseURL:`${import.meta.env.VITE_BACKEND_URI}/api/`
});

const PUBLIC_ROUTES = ["register/", "login/"];

API.interceptors.request.use((config) => {
  const isPublic = PUBLIC_ROUTES.some((route) => config.url?.endsWith(route));

  if (!isPublic) {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default API;
