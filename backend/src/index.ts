import express, { Response } from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { log } from "console";
import { StatusCodes } from "http-status-codes";
import connectDB from "./config/db.config";
import authRoutes from "./features/auth/auth.routes";
import adminRoutes from "./features/admin/admin.routes";

const PORT = process.env.PORT || 3333;

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5555",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);

app.get("/", (_, res: Response) => {
  return res
    .status(StatusCodes.OK)
    .json({ message: "Server is up and running..." });
});

server.listen(PORT, () => {
  log(`Server is running at ${PORT}`);
  connectDB();
});
