require("dotenv").config();

const express = require("express");

const http = require("http");

const cors = require("cors");

const { Server } = require("socket.io");

const {
    createAdapter,
} = require("@socket.io/redis-adapter");

const {
    pubClient,
    subClient,
    connectRedis,
} = require("./redis/redisClient");

const socketHandler = require(
    "./socket/socketHandler"
);

const {
    connectRabbitMQ
} = require("./rabbitmq/producer");

const app = express();

app.use(cors());

app.use(express.json());

app.get("/health", (req, res) => {

    res.json({
        status: "OK",
        gateway: process.env.PORT,
    });

});

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

async function startServer() {

    // =========================
    // CONNECT REDIS
    // =========================

    await connectRedis();

    // CONNECT RABBITMQ
    await connectRabbitMQ();

    // =========================
    // SOCKET REDIS ADAPTER
    // =========================

    io.adapter(
        createAdapter(
            pubClient,
            subClient
        )
    );

    // =========================
    // SOCKET HANDLER
    // =========================

    socketHandler(io);

    const PORT =
        process.env.PORT || 5006;

    server.listen(PORT, () => {

        console.log(
            `🚀 Socket Gateway running on port ${PORT}`
        );

    });
}

startServer();