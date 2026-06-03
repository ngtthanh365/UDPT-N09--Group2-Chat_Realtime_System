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

const {
    connectRealtimeConsumer
} = require(
    "./rabbitmq/realtimeConsumer"
);

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

    try {

        await connectRedis();

        await connectRabbitMQ();

        io.adapter(
            createAdapter(
                pubClient,
                subClient
            )
        );

        socketHandler(io);

        await connectRealtimeConsumer(io);

        const PORT =
            process.env.PORT || 5006;

        server.listen(PORT, () => {

            console.log(
                `🚀 Socket Gateway running on port ${PORT}`
            );

        });

    } catch (error) {

        console.error(
            "❌ Socket Gateway Startup Error:",
            error.message
        );

        process.exit(1);

    }

}

startServer();