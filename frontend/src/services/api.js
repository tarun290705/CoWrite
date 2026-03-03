import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
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
