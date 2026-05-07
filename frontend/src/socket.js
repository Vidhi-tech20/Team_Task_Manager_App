import { io } from "socket.io-client";

// Apna deployed backend URL yahan daal dena
const rawUrl = import.meta.env.VITE_API_URL || "https://teamtaskmanagerapp-production-46ae.up.railway.app";
const BACKEND_URL = rawUrl.replace(/\/api\/?$/, "");

export const socket = io(BACKEND_URL, {
  path: "/socket.io",
  transports: ["websocket", "polling"],
  reconnection: true,
  autoConnect: true,
});
