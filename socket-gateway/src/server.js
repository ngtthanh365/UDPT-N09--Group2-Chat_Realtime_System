require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const socketHandler = require("./socket/socketHandler");

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

socketHandler(io);

const PORT = process.env.PORT || 5006;

server.listen(PORT, () => {
    console.log(
        `🚀 Socket Gateway running on port ${PORT}`
    );
});