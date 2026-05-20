const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");

const cors = require("cors");

const {
    pubClient,
    subClient,
    connectRedis,
} = require("./redis/redisClient");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

async function startServer() {

    await connectRedis();

    io.adapter(createAdapter(pubClient, subClient));

    io.on("connection", (socket) => {

        console.log("User connected:", socket.id);

        socket.on("send_message", (data) => {

            console.log("Message received:", data);

            io.emit("receive_message", data);

        });

        socket.on("disconnect", () => {

            console.log("User disconnected:", socket.id);

        });

    });

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {

        console.log(`Gateway running on port ${PORT}`);

    });

}

startServer();