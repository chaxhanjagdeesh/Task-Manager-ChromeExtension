import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(token: string) {
  if (!socket) {
    socket = io(
      "https://workplaceapi.epayroll.co.in",
      {
        path: "/socket.io",

        auth: {
          token,
        },

        transports: [
          "polling",
          "websocket",
        ],

        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      }
    );

    socket.on("connect", () => {
      console.log(
        "Socket.IO connected:",
        socket?.id
      );
    });

    socket.on("connect_error", (error) => {
      console.error(
        "Socket.IO connection error:",
        error
      );
    });

    socket.on("disconnect", (reason) => {
      console.log(
        "Socket.IO disconnected:",
        reason
      );
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}