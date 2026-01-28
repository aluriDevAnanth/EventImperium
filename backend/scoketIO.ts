import { Server as Engine } from "@socket.io/bun-engine";
import { Server } from "socket.io";

export const userSocketMap = new Map<string, string>();

export const io = new Server();
export const engine = new Engine();
export const { websocket } = engine.handler();

io.bind(engine);

io.on("connection", (socket) => {
  console.log(
    `[${socket.handshake.query.userID}] socket.io connected: ${socket.id}`,
  );
  userSocketMap.set(socket.handshake.query.userID as string, socket.id);

  socket.on("disconnect", () => {
    userSocketMap.delete(socket.handshake.query.userID as string);
    console.log(
      `User ${socket.handshake.query.userID} removed from userSocketMap`,
    );
  });

  socket.on("error", (error) => {
    console.error(`Error ${socket.handshake.query.userID}: ${error}`);
  });
});
