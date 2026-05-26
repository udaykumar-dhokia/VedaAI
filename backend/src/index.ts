import express, { Response } from "express";
import http from "http";
import cors from "cors";
import "dotenv/config";
import { log } from "console";
import { StatusCodes } from "http-status-codes";

const PORT = process.env.PORT || 3333;

const app = express();
const server = http.createServer(app);

app.use(cors());

app.get("/", (_, res: Response) => {
  return res
    .status(StatusCodes.OK)
    .json({ message: "Server is up and running..." });
});

server.listen(PORT, () => {
  log(`Server is running at ${PORT}`);
});
