import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import clientRoutes from "./routes/clientRoutes.js";
import entryRoutes from "./routes/entryRoutes.js";
import userRoutes from "./routes/user.routes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import workspaceTaskRoutes from "./routes/workspaceTaskRoutes.js";
import workspaceNoteRoutes from "./routes/workspaceNoteRoutes.js";
import workspaceChatRoutes from "./routes/workspaceChat.js";
import User from "./models/User.js";
import Message from "./models/Message.js";
import WorkspaceMember from "./models/WorkspaceMember.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
app.use(express.json());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
app.get("/", (req, res) => {
  res.send("API Running");
});

app.use("/api/entries", entryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.get(
  "/api/profile",
  authMiddleware,
  (req, res) => {
    res.json({
      message: "Protected Route",
      user: req.user,
    });
  }
);
app.use(
  "/api/workspaces",
  workspaceNoteRoutes
);
app.use(
  "/api/workspaces",
  workspaceTaskRoutes
);
app.use(
  "/api/workspaces",
  workspaceRoutes
);
app.use(
  "/api/user",
  userRoutes
);
app.use(
  "/api/workspaces",
  workspaceChatRoutes
);

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token;
    if (!token) {
      return next(
        new Error("Authentication required")
      );
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
    const user = await User.findById(
      decoded.id
    ).select("_id name email");

    if (!user) {
      return next(
        new Error("User not found")
      );
    }
    socket.user = user;
    next();
  } catch (error) {
    console.error(
      "Socket authentication failed:",
      error
    );

    next(
      new Error("Invalid authentication")
    );
  }
});
async function isWorkspaceMember(
  workspaceId,
  userId
) {
  const member =
    await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: userId,
    });

  return !!member;
}
io.on("connection", (socket) => {
  console.log(
    `Socket connected: ${socket.user.name}`
  );

  socket.on(
    "join_workspace",
    async (workspaceId) => {
      try {
        const allowed =
          await isWorkspaceMember(
            workspaceId,
            socket.user._id
          );

        if (!allowed) {
          socket.emit(
            "workspace_error",
            {
              message:
                "You are not a member of this workspace.",
            }
          );

          return;
        }

        const room =
          `workspace:${workspaceId}`;

        socket.join(room);
        socket.workspaceId = workspaceId;

        console.log(
          `${socket.user.name} joined ${room}`
        );

        socket.emit(
          "workspace_joined",
          {
            workspaceId,
          }
        );
        socket.to(room).emit(
          "member_online",
          {
            userId:
              socket.user._id.toString(),
            name: socket.user.name,
          }
        );
      } catch (error) {
        console.error(
          "Failed to join workspace:",
          error
        );
      }
    }
  );

  socket.on(
    "leave_workspace",
    (workspaceId) => {
      const room =
        `workspace:${workspaceId}`;

      socket.leave(room);

      if (
        socket.workspaceId ===
        workspaceId
      ) {
        socket.workspaceId = null;
      }
    }
  );
  socket.on(
    "send_message",
    async ({
      workspaceId,
      content,
    }) => {
      try {
        const trimmedContent =
          typeof content === "string"
            ? content.trim()
            : "";
       if (!trimmedContent) {
          return;
        }

        if (trimmedContent.length > 2000) {
          socket.emit(
            "message_error",
            {
              message:
                "Message cannot exceed 2000 characters.",
            }
          );

          return;
        }

         const allowed =
          await isWorkspaceMember(
            workspaceId,
            socket.user._id
          );

        if (!allowed) {
          socket.emit(
            "message_error",
            {
              message:
                "You are not a member of this workspace.",
            }
          );

          return;
        }

          const message =
          await Message.create({
            workspace: workspaceId,
            sender: socket.user._id,
            content: trimmedContent,
          });

          const populatedMessage =
          await Message.findById(
            message._id
          ).populate(
            "sender",
            "name email"
          );

        const room =
          `workspace:${workspaceId}`;

        io.to(room).emit(
          "new_message",
          populatedMessage
        );
      } catch (error) {
        console.error(
          "Socket message error:",
          error
        );

        socket.emit(
          "message_error",
          {
            message:
              "Failed to send message.",
          }
        );
      }
    }
  );

  socket.on(
    "typing",
    async ({ workspaceId }) => {
      try {
        const allowed =
          await isWorkspaceMember(
            workspaceId,
            socket.user._id
          );

        if (!allowed) {
          return;
        }

        const room =
          `workspace:${workspaceId}`;

        socket
          .to(room)
          .emit(
            "user_typing",
            {
              userId:
                socket.user._id.toString(),
              name:
                socket.user.name,
            }
          );
      } catch (error) {
        console.error(
          "Typing event error:",
          error
        );
      }
    }
  );

 
  socket.on(
    "stop_typing",
    async ({ workspaceId }) => {
      const room =
        `workspace:${workspaceId}`;

      socket
        .to(room)
        .emit(
          "user_stop_typing",
          {
            userId:
              socket.user._id.toString(),
          }
        );
    }
  );


  socket.on("disconnect", () => {
    console.log(
      `Socket disconnected: ${socket.user.name}`
    );

     if (socket.workspaceId) {
      const room =
        `workspace:${socket.workspaceId}`;

      socket
        .to(room)
        .emit(
          "member_offline",
          {
            userId:
              socket.user._id.toString(),
          }
        );
    }
  });
});

server.listen(
  process.env.PORT,
  () => {
    console.log(
      `Server running on port ${process.env.PORT}`
    );
  }
);