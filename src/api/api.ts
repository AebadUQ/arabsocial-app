// api.ts
import { showSnack } from "@/components/common/CustomSnackbar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

/* ---------------------------------------
   🔥 SWITCH: LIVE OR LOCAL
----------------------------------------- */
const LIVE = true;

/* ---------------------------------------
   🔥 BASE URLS
----------------------------------------- */
const BASE_MAIN = LIVE
  ? "https://api.aebad.site"
  : "http://192.168.18.29:5000";

const BASE_CHAT = LIVE
  ? "https://chat.aebad.site"
  : "http://192.168.18.29:5001";

/* ---------------------------------------
   🔥 AXIOS INSTANCE
----------------------------------------- */
const api = axios.create({
  baseURL: BASE_MAIN,
  timeout: 15000,
});

export const setupInterceptors = (logout: () => void) => {
  /* ---------------------------------------
        REQUEST INTERCEPTOR
  ----------------------------------------- */
  api.interceptors.request.use(
    async (config: any) => {
      const token = await AsyncStorage.getItem("authToken");

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      const url = config.url || "";

      if (url.startsWith("/chat") || url.startsWith("/group")) {
        config.baseURL = BASE_CHAT;
      } else {
        config.baseURL = BASE_MAIN;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  /* ---------------------------------------
        RESPONSE INTERCEPTOR
  ----------------------------------------- */
  api.interceptors.response.use(
    /* ----------- SUCCESS HANDLER ----------- */
    (response) => {
      const method = response.config?.method?.toLowerCase();
      const status = response.status;

      const isWrite =
        method && ["post", "put", "patch", "delete"].includes(method);

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

    /* ----------- ERROR HANDLER ----------- */
    (error) => {
      console.log("📡 AXIOS ERROR:", error);

      const status = error?.response?.status;

      if (status === 401) {
        logout();
        showSnack("Your session has expired. Please log in again.", "error");
      }

      let message = "Something went wrong";

      if (error.response?.data) {
        const data = error.response.data;

        if (typeof data.message === "string") message = data.message;
        else if (Array.isArray(data.message)) message = data.message.join(", ");
        else if (typeof data.error === "string") message = data.error;
      } else if (error.message) {
        message = error.message;
      }

      showSnack(message, "error");
      return Promise.reject(new Error(message));
    }
  );
};

export default api;
