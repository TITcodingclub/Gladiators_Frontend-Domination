const Room = require("../models/Room");

const rooms = {};        // In-memory room map
const socketToUser = {}; // Map of socketId => user

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    socket.on("check-room", (roomID, cb) => cb(!!rooms[roomID]));

    socket.on("create-room", async ({ roomID, user }) => {
      if (!rooms[roomID]) {
        rooms[roomID] = { host: socket.id, users: { [socket.id]: user } };
        socketToUser[socket.id] = user;
        socket.join(roomID);
        await Room.create({
          roomID,
          hostSocketId: socket.id,
          users: [{ socketId: socket.id, ...user }],
        });
        console.log(`🏠 Room created: ${roomID}`);
      }
    });

    socket.on("request-to-join", ({ roomID, user }) => {
      const room = rooms[roomID];
      if (room) {
        socketToUser[socket.id] = user;
        io.to(room.host).emit("new-join-request", { from: socket.id, user });
      }
    });

    socket.on("respond-to-request", ({ to, roomID, accepted }) => {
      if (accepted) {
        io.to(to).emit("request-accepted");
      } else {
        io.to(to).emit("request-declined");
        delete socketToUser[to];
      }
    });

    socket.on("join-room", async ({ roomID, user }) => {
      const room = rooms[roomID];
      if (!room) return;

      room.users[socket.id] = user;
      socketToUser[socket.id] = user;
      socket.join(roomID);

      const otherUsers = { ...room.users };
      delete otherUsers[socket.id];

      socket.emit("all-users", otherUsers);

      await Room.findOneAndUpdate(
        { roomID },
        { $push: { users: { socketId: socket.id, ...user } } }
      );
    });

    socket.on("sending-signal", ({ userToSignal, callerID, signal }) => {
      io.to(userToSignal).emit("user-joined", {
        signal,
        callerID,
        user: socketToUser[callerID],
      });
    });

    socket.on("returning-signal", ({ callerID, signal }) => {
      io.to(callerID).emit("receiving-returned-signal", {
        signal,
        id: socket.id,
      });
    });

    socket.on("toggle-mic", ({ roomID, micOn }) => {
      socket.to(roomID).emit("user-toggled-mic", {
        userID: socket.id,
        micOn,
      });
    });

    socket.on("toggle-video", ({ roomID, videoOn }) => {
      socket.to(roomID).emit("user-toggled-video", {
        userID: socket.id,
        videoOn,
      });
    });

    const handleDisconnect = async () => {
      const user = socketToUser[socket.id];
      if (!user) return;

      let roomID;
      for (const id in rooms) {
        if (rooms[id].users[socket.id]) {
          roomID = id;
          break;
        }
      }

      if (roomID) {
        const room = rooms[roomID];
        delete room.users[socket.id];

        if (socket.id === room.host) {
          Object.keys(room.users).forEach((uid) =>
            io.to(uid).emit("host-left")
          );
          delete rooms[roomID];
          await Room.deleteOne({ roomID });
        } else {
          io.to(roomID).emit("user-disconnected", socket.id);
          await Room.findOneAndUpdate(
            { roomID },
            { $pull: { users: { socketId: socket.id } } }
          );
        }
      }

      delete socketToUser[socket.id];
      console.log(`❌ Disconnected: ${socket.id}`);
    };

    socket.on("leave-room", handleDisconnect);
    socket.on("disconnect", handleDisconnect);
  });
};
