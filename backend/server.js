const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http"); // New
const { Server } = require("socket.io"); // New
const connectDB = require("./config/db");
const routes = require("./routes");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Main Routes
app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({ message: "Team Task Manager API is running" });
});

// Create HTTP Server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Deployed URL yahan daal sakte ho security ke liye
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

// Connection test
io.on("connection", (socket) => {
  console.log("A user connected via socket:", socket.id);

  socket.on("join_room", (room) => {
    if (room) {
      const roomId = room.toString();
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Export IO instance for controllers to use
app.set("socketio", io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Real-time Server running on port ${PORT}`);
});
