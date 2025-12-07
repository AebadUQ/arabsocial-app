// socket/socket.js
import { io } from "socket.io-client";

let socket;

export const initSocket = (token) => {
  socket = io("https://chat.aebad.site", {
    transports: ["websocket"],
    auth: { token },
  });

  socket.on("connect", () => {
    console.log("🔥 Socket connected: ", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected");
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};
