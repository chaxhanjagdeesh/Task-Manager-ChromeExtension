import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import clientRoutes from "./routes/clientRoutes.js";
import entryRoutes from "./routes/entryRoutes.js";
import userRoutes from "./routes/user.routes.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("API Running");
});
app.use("/api/entries", entryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.get("/api/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Protected Route",
    user: req.user,
  });
});
app.use("/api/user", userRoutes);
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});