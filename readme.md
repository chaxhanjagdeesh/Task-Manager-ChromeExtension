# Worknest Workspaces

> A workspace-based team collaboration platform built as a Chrome extension with real-time communication, task management, workspace members, and secure authentication.

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-API-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?logo=socketdotio&logoColor=white)](https://socket.io/)

---

## Overview

**Worknest Workspaces** is a Chrome-based team collaboration platform designed to bring workspace management and team communication into a single focused interface.

Users can create and work inside dedicated workspaces where they can manage tasks, communicate with team members in real time, view workspace members, and organize their team's day-to-day work.

The project consists of a Chrome extension frontend and a Node.js backend API.

---

## Features

### Workspace Management

- Create and manage workspaces
- Workspace-based organization
- Workspace member management
- Role-based workspace membership
- Dedicated workspace views

### Task Management

- Create workspace tasks
- Manage task information
- Organize work within individual workspaces
- Workspace-specific task data

### Real-Time Team Chat

- Workspace group chat
- Real-time message delivery using Socket.IO
- Messages are persisted in MongoDB
- Sender information is populated with user data
- Automatic scrolling to new messages
- Enter to send messages
- Shift + Enter for multiline messages
- Message length validation

### Members

- View workspace members
- Member roles
- User information
- Online/offline presence support
- Relative activity timestamps

### Authentication

- Secure user authentication
- JWT-based authentication
- Protected API routes
- Socket.IO authentication
- Workspace membership authorization

---

## Architecture

Worknest uses a client/server architecture:

```text
                         ┌─────────────────────────┐
                         │      Chrome Extension   │
                         │                         │
                         │  React + TypeScript     │
                         │  Vite + CRXJS           │
                         └────────────┬────────────┘
                                      │
                         HTTPS / REST │ Socket.IO
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │       Nginx / Plesk      │
                         │                         │
                         │   Reverse Proxy / SSL   │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │      Node.js Server     │
                         │                         │
                         │ Express + Socket.IO     │
                         │ JWT Authentication      │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │        MongoDB           │
                         │                         │
                         │ Users                   │
                         │ Workspaces              │
                         │ Tasks                   │
                         │ Messages                │
                         │ Members                 │
                         └─────────────────────────┘