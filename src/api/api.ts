// api.ts
import { showSnack } from "@/components/common/CustomSnackbar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const api = axios.create({
  // baseURL: "http://192.168.18.29:3000",
  baseURL: "https://arabsocials.duckdns.org",
  timeout: 10000,
});

export const setupInterceptors = (logout: () => void) => {
  /* 🔹 REQUEST INTERCEPTOR */
  api.interceptors.request.use(
    async (config) => {
      const token = await AsyncStorage.getItem("authToken");
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

  /* 🔹 RESPONSE INTERCEPTOR */
  api.interceptors.response.use(
    (response) => {
      // ✅ Generic success toast for write operations
      const method = response.config?.method?.toLowerCase();

      if (["post", "put", "patch", "delete"].includes(method || "")) {
        console.log("reee",response.data.message)
        // You can customize per-endpoint if needed using response.config.url
        showSnack(response.data.message, "success");
      }

      return response;
    },
    (error) => {
      const status = error?.response?.status;

      // 🔐 401 → logout + message
      if (status === 401) {
        console.log("401 Unauthorized → logging out");
        logout();
        showSnack("Your session has expired. Please log in again.", "error");
      }

      // 🔍 Extract readable error message
      let message = "Something went wrong";

      if (error.response && error.response.data) {
        const data = error.response.data;

        if (typeof data.message === "string") {
          message = data.message;
        } else if (Array.isArray(data.message)) {
          message = data.message.join(", ");
        } else if (typeof data.error === "string") {
          message = data.error;
        }
      } else if (error.message) {
        message = error.message;
      }

      // 🔔 Show error toast globally
      showSnack(message, "error");

      return Promise.reject(new Error(message));
    }
  );
};

export default api;
