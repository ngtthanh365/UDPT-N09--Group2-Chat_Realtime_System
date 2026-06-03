require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const {
    connectRabbitMQConsumer,
} = require("./rabbitmq/consumer");

const notificationRoutes = require(
    "./routes/notificationRoutes"
);

const {
    connectRealtimeProducer
} = require(
    "./rabbitmq/realtimeProducer"
);

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", notificationRoutes);

const PORT =
    process.env.PORT || 5005;

const startServer = async () => {
    try {

        await connectDB();

        await connectRabbitMQConsumer();

        await connectRealtimeProducer();
        
        app.listen(PORT, () => {
            console.log(
                `🚀 Notification Service running on port ${PORT}`
            );
        });

    } catch (error) {

        console.log(
            "❌ Notification Service Startup Error:",
            error.message
        );

        process.exit(1);
    }
};

startServer();