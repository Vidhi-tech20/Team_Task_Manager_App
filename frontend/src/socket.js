import { io } from "socket.io-client";

// Apna deployed backend URL yahan daal dena
const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const BACKEND_URL = rawUrl.replace(/\/api\/?$/, "");

export const socket = io(BACKEND_URL, {
  path: "/socket.io",
  transports: ["websocket", "polling"],
  reconnection: true,
  autoConnect: true,
});
