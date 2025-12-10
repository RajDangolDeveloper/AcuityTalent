import axios from "axios";

const apiClient = await axios.create({
  baseURL: "http://localhost:4000/api",
});

export default apiClient;
