import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";

const api = axios.create({
  // Sử dụng Nginx API Gateway
  baseURL: import.meta.env.MODE === "development" ? "http://localhost/api" : "/api",
});

// gắn access token vào req header
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// Bắt lỗi 401/403 (Token hết hạn hoặc không hợp lệ)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      useAuthStore.getState().clearState();
      // Không gọi API refresh vì Backend chưa hỗ trợ
    }
    return Promise.reject(error);
  }
);

export default api;
