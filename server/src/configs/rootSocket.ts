import socketIo from "socket.io";

export const rootSocket = (io: socketIo.Server) => {
  io.on("connection", (socket) => {
    console.log("New connection");
    console.log("Socket Id:", socket.id);
    socket.on("join-new-room", (room) => {
      console.log("join new room", room);
      socket.join(room);
    });

    socket.on("disconnect", () => {
      console.log("disconnected");
      console.log(socket.rooms.size);
    });
  });
  return io;
};
