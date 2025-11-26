import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
});

export const SocketProvider = ({
  token,
  children,
}: {
  token: string | null;
  children: React.ReactNode;
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    // 🔥 Create socket instance
    const s: Socket = io("http://192.168.18.29:3001", {
      transports: ["websocket"],
      auth: { token },
    });

    setSocket(s);

    // Events
    s.on("connect", () => console.log("📡 SOCKET CONNECTED:", s.id));
    s.on("disconnect", () => console.log("🔌 SOCKET DISCONNECTED"));

    // ❗ Correct cleanup with a function
    return () => {
      console.log("🧹 CLEANUP: disconnecting socket");
      s.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext).socket;
