require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const recipeRoutes = require("./routes/recipeRoutes");
const roomRoutes = require("./routes/roomRoutes");
const userRoutes = require("./routes/userRoutes");
const userRegistrationRoute = require("./routes/userRegistrationRoute");
const socketHandler = require("./socket/socketHandler");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// Routes
app.use("/api/recipes", recipeRoutes);
app.use("/api/rooms", roomRoutes);

// ✅ Users routes
app.use("/api/users", userRoutes); // existing user operations (login, profile, etc.)
app.use("/api/users", userRegistrationRoute); // registration route

// WebSocket
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
socketHandler(io);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
