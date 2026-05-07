import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api", // Fallback to localhost if VITE_API_URL is not set

  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
