import axios from "axios";

//State isrefreshing untuk
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve()));
  failedQueue = [];
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Guard: network error atau request tanpa config
    if (!error.config) return Promise.reject(error);

    const originalRequest = error.config;
    const url: string = originalRequest.url ?? "";

    // Skip refresh untuk SEMUA auth routes — mereka public
    // dan tidak perlu token refresh cycle
    if (url.startsWith("/auth/")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Jika sedang refresh, antrekan request lain yang ikut 401
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch(Promise.reject);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh-token");
        processQueue(null);
        return api(originalRequest);
      } catch (err) {
        processQueue(err);
        // Jangan redirect paksa di sini — biarkan komponen
        // yang memanggil API yang menentukan redirect.
        // window.location.href di sini menyebabkan infinite reload loop.
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
