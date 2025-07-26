const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this to your frontend's URL
    methods: ["GET", "POST"],
  },
});

// --- Data Structures ---
// rooms: Stores room information, including the host and a map of users in the room.
// { [roomID]: { host: socket.id, users: { [socket.id]: { displayName, uid, etc. } } } }
const rooms = {}; 
// socketToUser: A simple map to quickly find a user's info from their socket ID.
const socketToUser = {}; 

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // --- Room Management ---

  // A client checks if a room exists before attempting to join.
  socket.on("check-room", (roomID, callback) => {
    callback(!!rooms[roomID]);
  });

  // The first user creates a room and becomes the host.
  socket.on("create-room", ({ roomID, user }) => {
    rooms[roomID] = {
      host: socket.id,
      users: {
        [socket.id]: user
      },
    };
    socketToUser[socket.id] = user;
    socket.join(roomID);
    console.log(`${user.displayName} created and joined room ${roomID} as host.`);
  });

  // A subsequent user requests to join an existing room.
  socket.on("request-to-join", ({ roomID, user }) => {
    const room = rooms[roomID];
    if (room && room.host) {
      socketToUser[socket.id] = user; // Temporarily store user info
      // Forward the request to the host of the room.
      io.to(room.host).emit("new-join-request", { from: socket.id, user });
      console.log(`${user.displayName} is requesting to join room ${roomID}.`);
    }
  });

  // The host accepts or declines a join request.
  socket.on("respond-to-request", ({ to, roomID, accepted }) => {
    if (accepted) {
      io.to(to).emit("request-accepted");
      console.log(`Host accepted request from ${to} for room ${roomID}.`);
    } else {
      io.to(to).emit("request-declined");
      console.log(`Host declined request from ${to} for room ${roomID}.`);
      delete socketToUser[to]; // Clean up user info if declined.
    }
  });
  
  // A user, after being accepted, formally joins the room to set up peer connections.
  socket.on("join-room", ({ roomID, user }) => {
    const room = rooms[roomID];
    if (room) {
      room.users[socket.id] = user;
      socket.join(roomID);
      
      // Get all other users in the room except for the one who just joined.
      const otherUsers = { ...room.users };
      delete otherUsers[socket.id];
      
      // Send the list of other users to the new joiner.
      socket.emit("all-users", otherUsers);
      console.log(`${user.displayName} has now officially joined room ${roomID}.`);
    }
  });

  // --- WebRTC Signaling Handlers ---

  // Relays the initial signal from a new peer to an existing peer.
  socket.on("sending-signal", (payload) => {
    io.to(payload.userToSignal).emit("user-joined", {
      signal: payload.signal,
      callerID: payload.callerID,
      user: socketToUser[payload.callerID], // Include the user info of the joiner
    });
  });

  // Relays the return signal from an existing peer back to the new peer.
  socket.on("returning-signal", (payload) => {
    io.to(payload.callerID).emit("receiving-returned-signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });
  
  // --- In-Call Action Handlers ---

  // Broadcasts a user's microphone status change to others in the room.
  socket.on("toggle-mic", ({ roomID, micOn }) => {
    socket.to(roomID).emit("user-toggled-mic", { userID: socket.id, micOn });
  });

  // Broadcasts a user's video status change to others in the room.
  socket.on("toggle-video", ({ roomID, videoOn }) => {
    socket.to(roomID).emit("user-toggled-video", { userID: socket.id, videoOn });
  });

  // --- Disconnect and Leave Handler ---

  const handleDisconnect = () => {
    const user = socketToUser[socket.id];
    console.log(`${user?.displayName || 'User'} disconnected: ${socket.id}`);
    
    let roomID;
    // Find which room the disconnected user was part of.
    for (const id in rooms) {
        if (rooms[id].users[socket.id]) {
            roomID = id;
            break;
        }
    }
    
    if (roomID) {
        const room = rooms[roomID];
        // Remove the user from the room's user list.
        delete room.users[socket.id];
        
        // If the host disconnected, the call ends for everyone.
        if (socket.id === room.host) {
            console.log(`Host of room ${roomID} disconnected. Closing room.`);
            // Notify all remaining users that the room is closed.
            Object.keys(room.users).forEach(userID => {
                io.to(userID).emit("host-left");
            });
            delete rooms[roomID];
        } else {
            // If a regular user disconnected, just notify others in the room.
            io.to(roomID).emit("user-disconnected", socket.id);
        }
    }
    // Clean up the user from the lookup map.
    delete socketToUser[socket.id];
  };

  socket.on("leave-room", handleDisconnect);
  socket.on("disconnect", handleDisconnect);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
