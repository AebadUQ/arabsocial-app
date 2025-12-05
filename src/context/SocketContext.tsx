import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: Record<number, boolean>;  // ✔ add online users map
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: {},
});

export const SocketProvider = ({
  token,
  children,
}: {
  token: string | null;
  children: React.ReactNode;
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Record<number, boolean>>({}); // ✔

  useEffect(() => {
    if (!token) return;

    // 🔥 Create socket instance
    const s: Socket = io("http://192.168.18.29:5001", {
      transports: ["websocket"],
      auth: { token },
    });

    setSocket(s);

    // 📡 Connected
    s.on("connect", () => console.log("📡 SOCKET CONNECTED:", s.id));

    // 🔌 Disconnected
    s.on("disconnect", () => console.log("🔌 SOCKET DISCONNECTED"));

    // 🟢 USER ONLINE EVENT
    s.on("user_online", (data: { userId: number }) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [data.userId]: true,
      }));
    });
    // ⚪ USER OFFLINE EVENT
    s.on("user_offline", (data: { userId: number }) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [data.userId]: false,
      }));
    });

    // ❗ Cleanup on unmount
    return () => {
      console.log("🧹 CLEANUP: disconnecting socket");
      s.disconnect();
    };
  }, [token]);
console.log("onlineUsers",JSON.stringify(onlineUsers))

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

// CUSTOM HOOK
export const useSocket = () => useContext(SocketContext);

// import React, { createContext, useContext, useEffect, useState } from "react";
// import { io, Socket } from "socket.io-client";

// interface SocketContextType {
//   socket: Socket | null;
// }

// const SocketContext = createContext<SocketContextType>({
//   socket: null,
// });

// export const SocketProvider = ({
//   token,
//   children,
// }: {
//   token: string | null;
//   children: React.ReactNode;
// }) => {
//   const [socket, setSocket] = useState<Socket | null>(null);

//   useEffect(() => {
//     if (!token) return;

//     // 🔥 Create socket instance
//     const s: Socket = io("http://192.168.18.29:3001", {
//       transports: ["websocket"],
//       auth: { token },
//     });

//     setSocket(s);

//     // Events
//     s.on("connect", () => console.log("📡 SOCKET CONNECTED:", s.id));
//     s.on("disconnect", () => console.log("🔌 SOCKET DISCONNECTED"));

//     // ❗ Correct cleanup with a function
//     return () => {
//       console.log("🧹 CLEANUP: disconnecting socket");
//       s.disconnect();
//     };
//   }, [token]);

//   return (
//     <SocketContext.Provider value={{ socket }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export const useSocket = () => useContext(SocketContext).socket;
