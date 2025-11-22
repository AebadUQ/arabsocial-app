// api.ts
import { showSnack } from "@/components/common/CustomSnackbar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.18.29:3000",
  // baseURL: "https://arabsocials.duckdns.org",
  // timeout: 10000,
});

export const setupInterceptors = (logout: () => void) => {
  /* 🔹 REQUEST INTERCEPTOR */
  api.interceptors.request.use(
    async (config: any) => {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  /* 🔹 RESPONSE INTERCEPTOR */
  api.interceptors.response.use(
    (response) => {
      const method = response.config?.method?.toLowerCase();
      const status = response.status;

      // ✅ write methods only
      const isWrite =
        method && ["post", "put", "patch", "delete"].includes(method);

      // ❌ 200 pe success snackbar mat dikhana
      // sirf tab dikhaye jab:
      // - write request ho
      // - status 2xx ho
      // - status !== 200 ho (e.g. 201, 204)
      if (
        isWrite &&
        status >= 200 &&
        status < 300 &&
        status !== 200 &&
        response.data?.message
      ) {
        showSnack(response.data.message, "success");
      }

      return response;
    },
    (error) => {
        console.log("📡 AXIOS ERROR RAW:", error);
  console.log("📡 AXIOS ERROR CODE:", error.code);
  console.log("📡 AXIOS ERROR MESSAGE:", error.message);
  console.log("📡 AXIOS ERROR REQUEST:", error.request);
  console.log("📡 AXIOS ERROR RESPONSE:", error.response);
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
