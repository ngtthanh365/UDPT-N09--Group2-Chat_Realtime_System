const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const {
    connectRabbitMQConsumer
} = require("./rabbitmq/consumer");

const messageRoutes = require("./routes/messageRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", messageRoutes);

const PORT = process.env.PORT || 5003;

const startServer = async () => {

    try {

        // MongoDB
        await connectDB();

        // RabbitMQ
        await connectRabbitMQConsumer();

        app.listen(PORT, () => {

            console.log(
                `🚀 Message Service running on port ${PORT}`
            );

        });

    } catch (error) {

        console.log(
            "❌ Message Service Startup Error:",
            error.message
        );

        process.exit(1);

    }

};

startServer();