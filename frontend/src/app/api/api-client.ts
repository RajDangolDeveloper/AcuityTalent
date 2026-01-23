import axios from "axios";
import { getSession } from "next-auth/react";

const apiClient = axios.create({
  baseURL: "http://localhost:4000/api",
});

apiClient.interceptors.request.use(
  async (config) => {
    // getSession() automatically looks for the NextAuth session cookie
    const session = await getSession();

    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default apiClient;
