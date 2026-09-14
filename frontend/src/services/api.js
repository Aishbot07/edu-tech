import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT to every protected request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    console.log("API REQUEST:", config.method?.toUpperCase(), config.url);
    console.log(
      "TOKEN ATTACHED:",
      token ? `${token.substring(0, 25)}...` : "NO TOKEN"
    );

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;