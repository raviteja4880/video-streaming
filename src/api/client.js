import axios from "axios";
import { toast } from "react-toastify";

// Automatically picks backend based on environment
const baseURL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://video-streaming-backend-5g76.onrender.com/api");

const api = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= REQUEST INTERCEPTOR ================= */

// Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */

let isLoggingOut = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;

    // Handle token expiry globally
    if (status === 401 && code === "TOKEN_EXPIRED") {
      if (!isLoggingOut) {
        isLoggingOut = true;

        localStorage.removeItem("token");

        toast.error("Session expired. Please login again.", {
          position: "top-center",
          autoClose: 3000,
          theme: "dark",
        });

        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
    } else {
      // Other API errors (keep your logging)
      console.error(
        "API Error:",
        status,
        error.response?.data || error.message
      );
    }

    return Promise.reject(error);
  }
);

export default api;
