import axios from "axios";
import { getSession } from "next-auth/react";

const apiClient = axios.create({
  baseURL: "http://localhost:4000/api",
});

apiClient.interceptors.request.use(
  async (config) => {
    console.log("[apiClient] Request Interceptor - URL:", config.url);
    console.log("[apiClient] Request method:", config.method?.toUpperCase());

    const session = await getSession();
    console.log("[apiClient] Session retrieved:", !!session);

    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
      console.log(
        "[apiClient] Authorization header set with token",
        session.accessToken,
      );
    } else {
      console.warn("[apiClient] No access token found in session");
    }

    console.log("[apiClient] Request headers:", {
      Authorization: config.headers.Authorization ? "Set" : "Not set",
      ContentType: config.headers["Content-Type"],
    });

    return config;
  },
  (error) => {
    console.error("[apiClient] Request Interceptor Error:", error);
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    console.log("[apiClient] Response Success", {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      dataKeys: response.data ? Object.keys(response.data).slice(0, 5) : null,
    });
    return response;
  },
  (error) => {
    console.error("[apiClient] Response Error", {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  },
);

export default apiClient;
