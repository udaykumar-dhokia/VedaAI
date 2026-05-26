import express, { Response } from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { log } from "console";
import { StatusCodes } from "http-status-codes";
import connectDB from "./config/db.config";

import AuthRoutes from "./features/auth/auth.routes";
import AdminRoutes from "./features/admin/admin.routes";

const PORT = process.env.PORT || 3333;

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (_, res: Response) => {
  return res
    .status(StatusCodes.OK)
    .json({ message: "Server is up and running..." });
});

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/admin", AdminRoutes);

server.listen(PORT, () => {
  log(`Server is running at ${PORT}`);
  connectDB();
});
