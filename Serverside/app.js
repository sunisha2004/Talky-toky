import express from "express";
import Router from "./router.js";
import connection from "./connection.js";
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use('/api', Router);

connection().then(() => {
    server.listen(process.env.PORT, () => {
        console.log(`server started at http://localhost:${process.env.PORT}`);
    });
}).catch((error) => {
    console.log(error);
});

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

export { io };
