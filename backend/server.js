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

/*
 * =====================================================
 * BASIC APP SETUP
 * =====================================================
 */

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.use(express.json());

/*
 * =====================================================
 * HTTP SERVER
 * =====================================================
 *
 * Socket.IO needs to attach to the HTTP server.
 */

const server = http.createServer(app);

/*
 * =====================================================
 * SOCKET.IO
 * =====================================================
 */

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

/*
 * =====================================================
 * DATABASE
 * =====================================================
 */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

/*
 * =====================================================
 * BASIC ROUTES
 * =====================================================
 */

app.get("/", (req, res) => {
  res.send("API Running");
});

/*
 * =====================================================
 * REST API ROUTES
 * =====================================================
 */

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

/*
 * =====================================================
 * SOCKET AUTHENTICATION
 * =====================================================
 */

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

    /*
     * Your JWT should contain the user ID
     * in decoded.id.
     *
     * If your authMiddleware uses another
     * property, change this accordingly.
     */

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

/*
 * =====================================================
 * CHECK WORKSPACE MEMBERSHIP
 * =====================================================
 */

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

/*
 * =====================================================
 * SOCKET CONNECTION
 * =====================================================
 */

io.on("connection", (socket) => {
  console.log(
    `Socket connected: ${socket.user.name}`
  );

  /*
   * ===================================================
   * JOIN WORKSPACE
   * ===================================================
   */

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

        /*
         * Remember which workspace this socket
         * is currently inside.
         */
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

        /*
         * Tell other members that this user
         * is online.
         */
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

  /*
   * ===================================================
   * LEAVE WORKSPACE
   * ===================================================
   */

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

  /*
   * ===================================================
   * SEND MESSAGE
   * ===================================================
   */

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

        /*
         * Validate content
         */
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

        /*
         * Check membership
         */
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

        /*
         * Save message to MongoDB
         */
        const message =
          await Message.create({
            workspace: workspaceId,
            sender: socket.user._id,
            content: trimmedContent,
          });

        /*
         * Populate sender
         */
        const populatedMessage =
          await Message.findById(
            message._id
          ).populate(
            "sender",
            "name email"
          );

        /*
         * Broadcast to everyone in workspace
         */
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

  /*
   * ===================================================
   * TYPING
   * ===================================================
   */

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

  /*
   * ===================================================
   * STOP TYPING
   * ===================================================
   */

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

  /*
   * ===================================================
   * DISCONNECT
   * ===================================================
   */

  socket.on("disconnect", () => {
    console.log(
      `Socket disconnected: ${socket.user.name}`
    );

    /*
     * Tell the workspace that this user
     * has disconnected.
     */
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

/*
 * =====================================================
 * START SERVER
 * =====================================================
 *
 * IMPORTANT:
 * Do NOT use app.listen().
 * Socket.IO is attached to `server`.
 */

server.listen(
  process.env.PORT,
  () => {
    console.log(
      `Server running on port ${process.env.PORT}`
    );
  }
);